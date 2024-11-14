// /src/components/buildings/buildings.js
import styles from './buildings.module.css';
import buildingStats from './building-stats.json';
import React, { useState, useEffect } from 'react';
import fallbackImage from '../../assets/images/buildings/fallback.png';

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

    // Check if the player meets the level requirement to buy the building
    const levelRequirement = buildingStats[buildingName]?.levelRequirement || 1;
    if (gameState.level < levelRequirement) {
      alert(`You need to be at least level ${levelRequirement} to buy this building!`);
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

    // Update gameState with new buildings object, deduct cost, and add experience
    const expReward = buildingStats[buildingName]?.expReward || 0;
    setGameState((prevState) => ({
      ...prevState,
      currency: prevState.currency - currentCost,
      buildings: newBuildings,
      experience: prevState.experience + expReward,
    }));
  };

  // Add five buildings at once or increase count if they exist
  const addFiveBuildings = (buildingName) => {
    let currentCount = buildings[buildingName]?.count || 0;
    let currentCost = buildings[buildingName]?.cost || buildingStats[buildingName].cost;
    const costIncreaseModifier = buildingStats[buildingName]?.costIncreaseModifier || 1.15;
    let totalCost = 0;

    // Calculate total cost for buying 5 buildings
    for (let i = 0; i < 5; i++) {
      totalCost += currentCost;
      currentCost = Math.round(currentCost * costIncreaseModifier);
    }

    // Check if user has enough currency to buy 5 buildings
    if (gameState.currency < totalCost) {
      alert('Not enough currency to buy 5 of this building!');
      return;
    }

    // Check if the player meets the level requirement to buy the building
    const levelRequirement = buildingStats[buildingName]?.levelRequirement || 1;
    if (gameState.level < levelRequirement) {
      alert(`You need to be at least level ${levelRequirement} to buy this building!`);
      return;
    }

    const newBuildings = {
      ...buildings,
      [buildingName]: {
        count: currentCount + 5,
        cost: currentCost,
      },
    };
    setBuildings(newBuildings);

    // Update gameState with new buildings object, deduct total cost, and add experience
    const expReward = buildingStats[buildingName]?.expReward || 0;
    setGameState((prevState) => ({
      ...prevState,
      currency: prevState.currency - totalCost,
      buildings: newBuildings,
      experience: prevState.experience + expReward * 5,
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
        {Object.entries(buildings).map(([building, { count, cost }]) => {
          const levelRequirement = buildingStats[building]?.levelRequirement || 1;
          if (gameState.level < levelRequirement) {
            // Hide the building if the player does not meet the level requirement
            return null;
          }
          return (
            <div key={building} className={styles.buildingItem}>
              <img 
                src={require(`../../assets/images/buildings/building_${building.toLowerCase().replace(/ /g, '_')}.png`)} 
                alt={building}
                className={styles.buildingThumbnail}
                onError={(e) => e.target.src = fallbackImage}
              />
              <div className={styles.buildingTitle}>{building}</div>
              <div className={styles.buildingDetails}>
                Count: {count} <br />
                Income: {buildingStats[building]?.income || 0} per interval <br />
                Next Cost: {cost.toLocaleString()} <br />
                Level Requirement: {levelRequirement}
              </div>
              <button 
                onClick={() => addBuilding(building)} 
                className={styles.buildingButton} 
                disabled={gameState.currency < cost}
              >
                Buy
              </button>
              <button 
                onClick={() => addFiveBuildings(building)} 
                className={styles.buildingButton} 
                disabled={gameState.currency < cost * 5}
              >
                Buy 5
              </button>
            </div>
          );
        })}
      </div>
      <button onClick={clearAllBuildings} className={`${styles.buildingButton} ${styles.devButton}`}>Clear All Buildings (Dev Button)</button>
    </div>
  );
}

export default Buildings;
