import React from 'react';
import styles from './enemyClick.module.css';
import enemyConfig from '../enemy/enemyConfig.json';
import worldLocations from '../worldmap/worldLocations.json';

const EnemyClick = ({ selectedEnemy, onCancel, onStartCombat }) => {
    if (!selectedEnemy) return null;

    // Handle description based on modifiers and original type
    const baseType = selectedEnemy.type.split(' ').pop(); // Extract base type, e.g., "Cow" from "Legendary Cow"
    const isModified = selectedEnemy.type.split(' ').length > 1; // Check if the type is modified

    // Fetch descriptions from enemyConfig
    const baseDescription = enemyConfig[baseType]?.description || "No description available.";
    const modifiedDescription = enemyConfig[baseType]?.modifiedDescription || `This is a special ${baseType.toLowerCase()} with enhanced abilities!`;

    // Determine which description to display
    const description = isModified ? modifiedDescription : baseDescription;

    // Fetch locations dynamically from worldLocations
    const locations = worldLocations
        .filter(location => location.enemies?.includes(baseType))
        .map(location => location.name);

    return (
        <div className={styles.popup}>
            <div className={styles.popupContent}>
                <div className={styles.leftContent}>
                    <h2>{selectedEnemy.type} (Level {selectedEnemy.properties.level})</h2>
                    <p className={styles.enemyDescription}>{description}</p>
                    <img 
                        src={selectedEnemy.image} 
                        alt={selectedEnemy.type} 
                        className={styles.enemyImage} 
                    />
                    <div className={styles.enemyLocations}>
                        <h3>Locations:</h3>
                        <ul>
                            {locations.length > 0 ? (
                                locations.map((location, index) => (
                                    <li key={index}>{location}</li>
                                ))
                            ) : (
                                <li>No locations available</li>
                            )}
                        </ul>
                    </div>
                    <div className={styles.buttons}>
                        <button onClick={() => onStartCombat(selectedEnemy)}>Fight</button>
                        <button onClick={onCancel}>Cancel</button>
                    </div>
                </div>
                <div className={styles.rightContent}>
                    <div className={styles.enemyStats}>
                        <h3>Stats:</h3>
                        {Object.entries(selectedEnemy.properties).map(([key, value]) => (
                            <p key={key}><strong>{key}:</strong> {value}</p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnemyClick;