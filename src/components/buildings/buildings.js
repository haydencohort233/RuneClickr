// /src/components/buildings/buildings.js
import React, { useState, useEffect } from 'react';
import buildingStats from './building-stats.json';
import styles from './buildings.module.css';

function Buildings({ gameState, setGameState }) {
  const [buildings, setBuildings] = useState(() => {
    // Initialize all buildings with a count of 0
    const initialBuildings = {};
    for (const buildingName in buildingStats) {
      if (buildingStats.hasOwnProperty(buildingName)) {
        initialBuildings[buildingName] = {
          count: 0,
          cost: buildingStats[buildingName].cost,
        };
      }
    }
    return initialBuildings;
  });

  useEffect(() => {
    // Load existing buildings from gameState if available, otherwise initialize with base stats
    if (gameState && gameState.buildings) {
      setBuildings((prevBuildings) => {
        const updatedBuildings = { ...prevBuildings };
        for (const buildingName in buildingStats) {
          if (buildingStats.hasOwnProperty(buildingName)) {
            if (gameState.buildings[buildingName]) {
              updatedBuildings[buildingName] = gameState.buildings[buildingName];
            } else {
              updatedBuildings[buildingName] = {
                count: 0,
                cost: buildingStats[buildingName].cost,
              };
            }
          }
        }
        return updatedBuildings;
      });
    }
  }, [gameState]);

  useEffect(() => {
    // Generate income based on building stats
    const incomeIntervals = Object.entries(buildings).map(([buildingName, { count }]) => {
      if (count > 0 && buildingStats[buildingName]) {
        const interval = setInterval(() => {
          setGameState((prevState) => ({
            ...prevState,
            currency: prevState.currency + count * buildingStats[buildingName].income,
          }));
        }, buildingStats[buildingName].incomeInterval);
        return interval;
      }
      return null;
    });

    // Clear intervals when component unmounts or buildings change
    return () => {
      incomeIntervals.forEach((interval) => {
        if (interval) clearInterval(interval);
      });
    };
  }, [buildings, setGameState]);

  // Add a new building or increase count if it exists
  const addBuilding = (buildingName) => {
    const currentCount = buildings[buildingName]?.count || 0;
    const currentCost = buildings[buildingName]?.cost || buildingStats[buildingName].cost;
    const costIncreaseModifier = buildingStats[buildingName]?.costIncreaseModifier || 1.15;
    const newCost = Math.round(currentCost * costIncreaseModifier); // Increase cost based on modifier from building-stats.json

    // Check if user has enough currency to buy the building
    if (gameState.currency < currentCost) {
      alert('Not enough currency to buy this building!');
      return;
    }

    const newBuildings = {
      ...buildings,
      [buildingName]: {
        count: currentCount + 1,
        cost: newCost,
      },
    };
    setBuildings(newBuildings);

    // Update gameState with new buildings object and deduct cost
    setGameState((prevState) => ({
      ...prevState,
      currency: prevState.currency - currentCost,
      buildings: newBuildings,
    }));
  };

  // Clear all buildings for development testing
  const clearAllBuildings = () => {
    console.log('Clearing all buildings for testing purposes');
    const clearedBuildings = {};
    for (const buildingName in buildingStats) {
      if (buildingStats.hasOwnProperty(buildingName)) {
        clearedBuildings[buildingName] = {
          count: 0,
          cost: buildingStats[buildingName].cost,
        };
      }
    }
    setBuildings(clearedBuildings);
    setGameState((prevState) => ({
      ...prevState,
      buildings: clearedBuildings,
    }));
  };

  return (
    <div className={styles.buildings}>
      <h2>Buildings</h2>
      <div className={styles.buildingList}>
        {Object.entries(buildings).map(([building, { count, cost }]) => (
          <div key={building} className={styles.buildingItem}>
            <img 
              src={require(`../../assets/images/buildings/building_${building.toLowerCase().replace(/ /g, '_')}.png`)} 
              alt={building}
              className={styles.buildingThumbnail}
            />
            <div className={styles.buildingTitle}>{building}</div>
            <div className={styles.buildingDetails}>
              Count: {count} <br />
              Income: {buildingStats[building]?.income || 0} per interval <br />
              Next Cost: {cost.toLocaleString()}
            </div>
            <button onClick={() => addBuilding(building)} className={styles.buildingButton}>Buy</button>
          </div>
        ))}
      </div>
      <button onClick={clearAllBuildings} className={`${styles.buildingButton} ${styles.devButton}`}>Clear All Buildings (Dev Button)</button>
    </div>
  );
}

export default Buildings;
