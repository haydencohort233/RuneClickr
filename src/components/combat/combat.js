import React, { useState, useEffect } from 'react';
import spells from './spells.json';

const Combat = ({ enemy, player = {}, setPlayer, onCombatEnd }) => {
    const [currentEnemy, setCurrentEnemy] = useState(enemy);
    const [playerHp, setPlayerHp] = useState(player?.hitpoints ?? 100); // Default to 100 if undefined
    const [enemyHp, setEnemyHp] = useState(enemy?.properties?.health ?? 50); // Default to 50 if undefined
    const [turn, setTurn] = useState('player'); // 'player' or 'enemy'

    useEffect(() => {
        if (player?.hitpoints !== undefined) {
            setPlayerHp(player.hitpoints);
        }
    }, [player.hitpoints]);

    const attackEnemy = () => {
        if (!currentEnemy || turn !== 'player') return;

        const playerAttackPower = player?.attackPower ?? 10; // Default to 10 if undefined
        const enemyDefencePower = currentEnemy?.properties?.defencePower ?? 0; // Default to 0 if undefined

        const attackRoll = Math.floor(Math.random() * playerAttackPower) + 1;
        const damageDealt = Math.max(0, attackRoll - enemyDefencePower); // Ensure non-negative damage
        const updatedEnemyHp = Math.max(0, enemyHp - damageDealt); // Prevent health from going below 0

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

        const enemyAttackPower = currentEnemy?.properties?.attackPower ?? 10; // Default to 10 if undefined
        const playerDefencePower = player?.defencePower ?? 5; // Default to 5 if undefined

        const attackRoll = Math.floor(Math.random() * enemyAttackPower) + 1;
        const damageDealt = Math.max(0, attackRoll - playerDefencePower); // Ensure non-negative damage
        const newPlayerHp = Math.max(0, playerHp - damageDealt); // Prevent health from going below 0

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
                    <p>Enemy Health: {enemyHp ?? 'Unknown'} / {currentEnemy?.properties?.health ?? 'Unknown'}</p> 
                    <p>Enemy Level: {currentEnemy?.properties?.level ?? 'Unknown'}</p> 
                    <button onClick={attackEnemy} disabled={turn !== 'player'}>Attack</button>
                </div>
            ) : (
                <p>No more enemies!</p>
            )}

            <div className="player-details">
                <h3>Player Stats</h3>
                <p>Player HP: {playerHp ?? 'Unknown'}</p>
                <p>Player Level: {player.level ?? 1}</p>
                <p>Player Attack Power: {player.attackPower ?? 10}</p>
                <p>Player Defence Power: {player.defencePower ?? 5}</p>
                <p>Player Experience: {player.experience ?? 0}</p>
            </div>
        </div>
    );
};

export default Combat;
