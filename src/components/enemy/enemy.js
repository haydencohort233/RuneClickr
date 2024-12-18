import React, { useEffect, useState } from 'react';
import worldLocations from '../worldmap/worldLocations.json';
import enemyConfig from './enemyConfig.json';
import modifiersConfig from './modifiers.json';
import './enemy.module.css';

const Enemy = ({ locationId, onStartCombat }) => {
    const [enemies, setEnemies] = useState([]);

    useEffect(() => {
        const location = worldLocations.find(loc => loc.id === locationId);
        console.log('Location ID:', locationId);
        console.log('Location Data:', location);
        if (location) {
            console.log('Enemies for Location:', location.enemies);
        } else {
            console.warn('No location found for ID:', locationId);
        }
    }, [locationId]);

    useEffect(() => {
        console.log('Calling spawnEnemies with locationId:', locationId);
        spawnEnemies(locationId);
    }, [locationId]);

    const spawnEnemies = (locationId) => {
        const location = worldLocations.find(loc => loc.id === locationId);
        if (!location) {
            console.warn('No location found for ID:', locationId);
            return;
        }

        const { enemies: enemyTypes, amount } = location;
        console.log('Enemy Types:', enemyTypes, 'Amount to spawn:', amount);
        const enemyCount = Math.floor(Math.random() * amount) + 1;
        console.log('Enemy Count:', enemyCount);

        const newEnemies = Array.from({ length: enemyCount }, () => generateEnemy(enemyTypes));
        console.log('Generated Enemies:', newEnemies);
        setEnemies(newEnemies);
    };

    const generateEnemy = (enemyTypes) => {
        console.log('Generating enemy from types:', enemyTypes);
        const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        console.log('Random Enemy Type:', randomType);
        let enemy = createEnemy(randomType);
        
        if (Math.random() < 0.1) {
            const modifier = getRandomModifier();
            console.log('Applying Modifier:', modifier);
            enemy = applyModifier(enemy, modifier);
        }

        console.log('Enemy After Modifiers:', enemy);
        executeAbilities(enemy);
        return enemy;
    };

    const createEnemy = (enemyType) => {
        console.log('Creating enemy of type:', enemyType);
        const config = enemyConfig[enemyType];
        console.log('Enemy Config:', config);
        if (!config) {
            console.warn(`No enemy configuration found for type: ${enemyType}`);
            return null;
        }
        const enemy = {
            id: crypto.randomUUID(),
            type: enemyType,
            properties: { ...config.properties },
            image: config.image,
            abilities: config.abilities || []
        };
        console.log('Created Enemy:', enemy);
        return enemy;
    };

    const getRandomModifier = () => {
        const keys = Object.keys(modifiersConfig);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        return modifiersConfig[randomKey];
    };

    const applyModifier = (enemy, modifier) => {
        Object.keys(modifier.properties).forEach(key => {
            if (key.endsWith('Multiplier')) {
                const statName = key.replace('Multiplier', '');
                if (enemy.properties.hasOwnProperty(statName)) {
                    enemy.properties[statName] *= modifier.properties[key];
                }
            }
        });
        enemy.type = `${modifier.name} ${enemy.type}`;
        enemy.specialTag = modifier.name;
        return enemy;
    };

    const executeAbilities = (enemy) => {
        enemy.abilities.forEach(ability => {
            if (ability === 'stun') {
                enemy.properties.attackPower *= 0.5;
            } else if (ability === 'heal') {
                enemy.properties.health += 20;
            }
        });
    };

    return (
        <>
            {enemies.map((enemy, index) => (
                <div 
                    key={enemy.id} 
                    className={`enemy ${enemy.specialTag?.toLowerCase()}`} 
                    onClick={() => onStartCombat(enemy)}
                >
                    <h3 className="enemy-header">{`${enemy.type} (Level ${enemy.properties.level})`}</h3>
                    <img 
                        src={enemy.image} 
                        alt={enemy.type} 
                        className="enemy-image" 
                        width="150"
                        height="100"
                    />
                    <div className="enemy-stats">
                        {Object.entries(enemy.properties).map(([key, value]) => (
                            <p key={key} className="enemy-stat">{key}: {value}</p>
                        ))}
                    </div>  
                    {enemy.specialTag && <p className="special-tag">{enemy.specialTag}</p>}
                </div>
            ))} 
        </>
    );
};

export default Enemy;
