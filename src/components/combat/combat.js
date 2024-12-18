import React, { useState, useEffect } from 'react';

const Combat = ({ enemy, player = {}, setPlayer, onCombatEnd }) => {
    const [currentEnemy, setCurrentEnemy] = useState(enemy);
    const [playerHp, setPlayerHp] = useState(player.hitpoints || 100);
    const [enemyHp, setEnemyHp] = useState(enemy.health);
    const [turn, setTurn] = useState('player'); // 'player' or 'enemy'

    useEffect(() => {
        if (player.hitpoints !== undefined) {
            setPlayerHp(player.hitpoints);
        }
    }, [player.hitpoints]);

    const attackEnemy = () => {
        if (!currentEnemy || turn !== 'player') return;

        const attackRoll = Math.floor(Math.random() * (player.attackPower || 10)) + 1;
        const damageDealt = Math.max(0, attackRoll - currentEnemy.defencePower);
        const updatedEnemyHp = Math.max(0, enemyHp - damageDealt);

        setEnemyHp(updatedEnemyHp);

        if (updatedEnemyHp <= 0) {
            alert(`${currentEnemy.type} has been defeated!`);
            onCombatEnd();
        } else {
            setTurn('enemy');
        }
    };

    const enemyAttack = () => {
        if (!currentEnemy || turn !== 'enemy') return;

        const attackRoll = Math.floor(Math.random() * currentEnemy.attackPower) + 1;
        const damageDealt = Math.max(0, attackRoll - (player.defencePower || 5));
        const newPlayerHp = Math.max(0, playerHp - damageDealt);

        setPlayerHp(newPlayerHp);

        if (newPlayerHp <= 0) {
            alert('You have been defeated!');
            onCombatEnd();
        } else {
            setPlayer((prevPlayer) => ({
                ...prevPlayer,
                hitpoints: newPlayerHp
            }));
            setTurn('player');
        }
    };

    useEffect(() => {
        if (turn === 'enemy') {
            const enemyAttackTimeout = setTimeout(enemyAttack, 1000);
            return () => clearTimeout(enemyAttackTimeout);
        }
    }, [turn]);

    return (
        <div className="combat-container">
            {currentEnemy ? (
                <div className="enemy-details">
                    <h3>Fighting: {currentEnemy.type}</h3>
                    <p>Enemy Health: {enemyHp}</p>
                    <p>Enemy Level: {currentEnemy.level}</p>
                    <button onClick={attackEnemy} disabled={turn !== 'player'}>Attack</button>
                </div>
            ) : (
                <p>No more enemies!</p>
            )}
            <div className="player-details">
                <h3>Player Stats</h3>
                <p>Player HP: {playerHp}</p>
                <p>Player Level: {player.level || 1}</p>
                <p>Player Attack Power: {player.attackPower || 10}</p>
                <p>Player Defence Power: {player.defencePower || 5}</p>
                <p>Player Experience: {player.experience || 0}</p>
            </div>
        </div>
    );
};

export default Combat;
