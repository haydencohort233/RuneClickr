// /components/enemy/enemy.js
import styles from './enemy.module.css';
import React, { useEffect, useState } from 'react';
import worldLocations from '../worldmap/worldLocations.json';
import enemyConfig from './enemyConfig.json';
import modifiersConfig from './modifiers.json';
import Combat from '../combat/combat';

const Enemy = ({ locationId, onStartCombat }) => {
    const [enemies, setEnemies] = useState([]);

    useEffect(() => {
        if (locationId) {
            spawnEnemies(locationId);
        }
    }, [locationId]);

    const spawnEnemies = (locationId) => {
        const location = worldLocations.find(loc => loc.id === locationId);
        if (!location) return;

        const { enemies: enemyTypes, amount } = location;
        let spawnedEnemies = [];
        const enemyCount = Math.ceil(Math.random() * amount); // Random count between 1 and max amount

        for (let i = 0; i < enemyCount; i++) {
            const randomEnemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            let enemy = { type: randomEnemyType, ...enemyConfig[randomEnemyType] };

            // Randomly assign modifiers
            const modifierChance = Math.random();
            if (modifierChance < 0.1) { // 10% chance to get a modifier
                const randomModifierKey = Object.keys(modifiersConfig)[Math.floor(Math.random() * Object.keys(modifiersConfig).length)];
                const modifier = modifiersConfig[randomModifierKey];
                enemy = {
                    ...enemy,
                    type: `${modifier.name} ${enemy.type}`,
                    level: enemy.level * modifier.levelMultiplier,
                    health: enemy.health * modifier.hpMultiplier,
                    damage: enemy.damage * modifier.damageMultiplier,
                    experience: enemy.experience * modifier.experienceMultiplier,
                    maxHit: enemy.maxHit * modifier.maxHitMultiplier,
                    attackPower: enemy.attackPower * modifier.attackPowerMultiplier,
                    defencePower: enemy.defencePower * modifier.defencePowerMultiplier,
                    specialTag: modifier.name
                };
            }

            spawnedEnemies.push(enemy);
        }

        setEnemies(spawnedEnemies);
    };

    return (
        <div className={styles['enemy-container']}>
            {enemies.map((enemy, index) => (
                <div key={index} className={styles.enemy}>
                    <h3>{enemy.type}</h3>
                    <img src={`http://localhost:5000${enemy.image}`} alt={enemy.type} onError={(e) => { e.target.src = 'http://localhost:5000/assets/images/enemies/fallback.png'; }} />
                    <p>Health: {enemy.health}</p>
                    <p>Attack Power: {enemy.attackPower}</p>
                    <p>Defence Power: {enemy.defencePower}</p>
                    <p>Level: {enemy.level}</p>
                    {enemy.specialTag && <p className={styles.specialTag}>{enemy.specialTag}</p>}
                    <button onClick={() => onStartCombat(enemy)}>Start Combat</button>
                </div>
            ))}
        </div>
    );
    
};

export default Enemy;
