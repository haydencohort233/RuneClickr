import React, { useEffect, useState } from 'react';
import worldLocations from '../worldmap/worldLocations.json';
import enemyConfig from './enemyConfig.json';
import modifiersConfig from './modifiers.json';
import './enemy.module.css';
import EnemyClick from './enemyClick';

const Enemy = ({ locationId, onStartCombat }) => {
    const [enemies, setEnemies] = useState([]);
    const [error, setError] = useState(null); // Error state
    const [selectedEnemy, setSelectedEnemy] = useState(null); // Selected enemy state

    useEffect(() => {
        try {
            const location = worldLocations.find(loc => loc.id === locationId);
            if (location) {
                console.log('Location Data:', location);
            } else {
                throw new Error(`No location found for ID: ${locationId}`);
            }
        } catch (err) {
            console.error(err);
            setError(err.message); // Set error message
        }
    }, [locationId]);

    useEffect(() => {
        try {
            spawnEnemies(locationId);
        } catch (err) {
            console.error(err);
            setError(err.message); // Set error message
        }
    }, [locationId]);

    const spawnEnemies = (locationId) => {
        try {
            const location = worldLocations.find(loc => loc.id === locationId);
            if (!location) {
                throw new Error(`No location found for ID: ${locationId}`);
            }
    
            const { enemies: enemyTypes, amount } = location;
            const enemyCount = Math.floor(Math.random() * amount) + 1;

            const newEnemies = Array.from({ length: enemyCount }, () => {
                const enemy = generateEnemy(enemyTypes);
                return enemy ? enemy : null; // Ensure no null enemies
            }).filter(Boolean); // Remove nulls

            setEnemies(newEnemies);
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    const generateEnemy = (enemyTypes) => {
        try {
            const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            let enemy = createEnemy(randomType);

            if (!enemy) {
                throw new Error(`Failed to generate enemy for type: ${randomType}. Check ./enemyConfig.json.`);
            }

            if (Math.random() < 0.1) {
                const modifier = getRandomModifier();
                if (!modifier) {
                    throw new Error(`Modifier not found. Check ./modifiers.json.`);
                }
                enemy = applyModifier(enemy, modifier);
            }

            executeAbilities(enemy);
            return enemy;
        } catch (err) {
            console.error(err);
            setError(`Error in generateEnemy: ${err.message}`);
            return null;
        }
    };

    const createEnemy = (enemyType) => {
        try {
            const config = enemyConfig[enemyType];
            if (!config) {
                throw new Error(`No configuration found for enemy type: "${enemyType}". Check ./enemyConfig.json.`);
            }
            return {
                id: crypto.randomUUID(),
                type: enemyType,
                properties: { ...config.properties },
                image: config.image,
                abilities: config.abilities || []
            };
        } catch (err) {
            console.error(err);
            setError(`Error in createEnemy: ${err.message}`);
            return null;
        }
    };

    const getRandomModifier = () => {
        const keys = Object.keys(modifiersConfig);
        if (keys.length === 0) {
            console.error('Modifiers config is empty. Check ./modifiers.json.');
            setError('Modifiers config is empty. Check ./modifiers.json.');
            return null;
        }
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

    const handleEnemyClick = (enemy) => {
        setSelectedEnemy(enemy);
    };

    const handleCancel = () => {
        setSelectedEnemy(null);
    };

    return (
        <>
            {error && (
                <div className="error-container">
                    <p>An error occurred:</p>
                    <textarea
                        className="error-message"
                        value={error}
                        readOnly
                        onClick={(e) => e.target.select()} // Auto-select for easy copying
                    />
                </div>
            )}
            {enemies.map((enemy, index) => (
                <div 
                    key={enemy.id} 
                    className={`enemy ${enemy.specialTag?.toLowerCase()}`}
                >
                    <h3 className="enemy-header">{`${enemy.type} (Level ${enemy.properties.level})`}</h3>
                    <img 
                        src={enemy.image} 
                        alt={enemy.type} 
                        className="enemy-image" 
                        width="150"
                        height="100"
                    />
                    <div className="enemy-actions">
                        <button onClick={() => onStartCombat(enemy)}>Fight</button>
                        <button onClick={() => handleEnemyClick(enemy)}>Info</button>
                    </div>
                </div>
            ))}

            <EnemyClick 
                selectedEnemy={selectedEnemy} 
                onCancel={handleCancel} 
                onStartCombat={onStartCombat} 
            />
        </>
    );
};

export default Enemy; 
