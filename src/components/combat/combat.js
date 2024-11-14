import React, { useState, useEffect } from 'react';

const Combat = ({ enemy, player = {}, setPlayer, onCombatEnd }) => {
    const [currentEnemy, setCurrentEnemy] = useState(enemy);
    const [playerHp, setPlayerHp] = useState(player.hitpoints || 100);

    useEffect(() => {
        if (player.hitpoints !== undefined) {
            setPlayerHp(player.hitpoints);
        }
    }, [player.hitpoints]);

    const attackEnemy = () => {
        if (!currentEnemy) return;

        // Calculate damage dealt by player to enemy
        const attackRoll = Math.floor(Math.random() * (player.attackPower || 10)) + 1;
        const damageDealt = Math.max(0, attackRoll - currentEnemy.defencePower);
        let updatedEnemyHp = currentEnemy.health - damageDealt;

        if (updatedEnemyHp <= 0) {
            // Enemy defeated
            alert(`${currentEnemy.type} has been defeated!`);
            onCombatEnd();
        } else {
            setCurrentEnemy({ ...currentEnemy, health: updatedEnemyHp });
        }
    };

    const enemyAttack = () => {
        if (!currentEnemy) return;

        // Enemy attacks player
        const attackRoll = Math.floor(Math.random() * currentEnemy.attackPower) + 1;
        const damageDealt = Math.max(0, attackRoll - (player.defencePower || 5));
        const newPlayerHp = playerHp - damageDealt;
        setPlayerHp(newPlayerHp);
        if (newPlayerHp <= 0) {
            alert('You have been defeated!');
            onCombatEnd();
        } else {
            setPlayer((prevPlayer) => ({
                ...prevPlayer,
                hitpoints: newPlayerHp
            }));
        }
    };

    return (
        <div className="combat-container">
            {currentEnemy ? (
                <div className="enemy-details">
                    <h3>Fighting: {currentEnemy.type}</h3>
                    <p>Enemy Health: {currentEnemy.health}</p>
                    <p>Enemy Level: {currentEnemy.level}</p>
                    <p>Enemy Attack Power: {currentEnemy.attackPower}</p>
                    <p>Enemy Defence Power: {currentEnemy.defencePower}</p>
                    <button onClick={attackEnemy}>Attack</button>
                    <button onClick={enemyAttack}>Enemy Attack</button>
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
