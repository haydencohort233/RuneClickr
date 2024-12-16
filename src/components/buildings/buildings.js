import styles from './buildings.module.css';
import buildingStats from './building-stats.json';
import React, { useState, useEffect, useRef } from 'react';
import fallbackImage from '../../assets/images/buildings/fallback.png';

function Buildings({ gameState, setGameState }) {
  const [buildings, setBuildings] = useState(() => {
    const initialBuildings = {};
    for (const buildingName in buildingStats) {
      initialBuildings[buildingName] = {
        count: 0,
        cost: buildingStats[buildingName].cost,
      };
    }
    return initialBuildings;
  });

  const [localCurrency, setLocalCurrency] = useState(0);
  const incomeInterval = useRef(null);

  // Load existing buildings from gameState
  useEffect(() => {
    if (gameState && gameState.buildings) {
      setBuildings(gameState.buildings);
    }
  }, [gameState]);

  // Central passive income loop (runs every 1 second)
  useEffect(() => {
    incomeInterval.current = setInterval(() => {
      let totalIncome = 0;
      for (const [buildingName, { count }] of Object.entries(buildings)) {
        if (count > 0 && buildingStats[buildingName]) {
          totalIncome += count * buildingStats[buildingName].income;
        }
      }

      if (totalIncome > 0) {
        setLocalCurrency(prev => prev + totalIncome);
      }
    }, 1000); // Run every second

    return () => clearInterval(incomeInterval.current);
  }, [buildings]);

  // Sync the local currency buffer to gameState every second
  useEffect(() => {
    if (localCurrency > 0) {
      setGameState(prevState => ({
        ...prevState,
        currency: prevState.currency + localCurrency
      }));
      setLocalCurrency(0); // Clear the local buffer after syncing
    }
  }, [localCurrency, setGameState]);

  const addBuilding = (buildingName) => {
    const currentCount = buildings[buildingName]?.count || 0;
    const currentCost = buildings[buildingName]?.cost || buildingStats[buildingName].cost;
    const costIncreaseModifier = buildingStats[buildingName]?.costIncreaseModifier || 1.15;
    const newCost = Math.round(currentCost * costIncreaseModifier);

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
    setGameState(prevState => ({
      ...prevState,
      currency: prevState.currency - currentCost,
      buildings: newBuildings
    }));
  };

  return (
    <div className={styles.buildings}>
      <h2>Buildings</h2>
      <div className={styles.buildingList}>
        {Object.entries(buildings).map(([buildingName, { count, cost }]) => (
          <div key={buildingName} className={styles.buildingItem}>
            <img 
              src={require(`../../assets/images/buildings/building_${buildingName.toLowerCase().replace(/ /g, '_')}.png`)} 
              alt={buildingName}
              className={styles.buildingThumbnail}
              onError={(e) => e.target.src = fallbackImage}
            />
            <div className={styles.buildingTitle}>{buildingName}</div>
            <div className={styles.buildingDetails}>
              Count: {count} <br />
              Income: {buildingStats[buildingName]?.income || 0} / second <br />
              Next Cost: {cost.toLocaleString()} <br />
            </div>
            <button onClick={() => addBuilding(buildingName)} className={styles.buildingButton}>
              Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Buildings;
