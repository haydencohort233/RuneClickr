import React, { useState, useEffect, useRef } from 'react';
import buildingStats from '../buildings/building-stats.json';
import styles from './currency.module.css';
import currencyLevels from './currencyLevels.json';

function Currency({ gameState, setGameState = () => {} }) {
  const [currency, setCurrency] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [currencyText, setCurrencyText] = useState('');
  
  const [localCurrency, setLocalCurrency] = useState(0);
  const [localClicks, setLocalClicks] = useState(0);
  const syncInterval = useRef(null);
  
  // Load initial currency from gameState on mount and whenever gameState.currency changes
  useEffect(() => {
    if (gameState?.currency !== undefined) {
      setCurrency(gameState.currency);
    }
  }, [gameState?.currency]);

  // Calculate total income whenever buildings change
  useEffect(() => {
    if (gameState && gameState.buildings) {
      let income = 0;
      for (const [buildingName, { count }] of Object.entries(gameState.buildings)) {
        if (count > 0 && buildingStats[buildingName]) {
          const buildingIncome = buildingStats[buildingName].income;
          income += buildingIncome * count;
        }
      }
      setTotalIncome(income);
    }
  }, [gameState.buildings]);

  // Sync localCurrency and localClicks to global gameState every 1000ms
  useEffect(() => {
    syncInterval.current = setInterval(() => {
      if (localCurrency > 0 || localClicks > 0) {
        setGameState(prevState => ({
          ...prevState,
          currency: prevState.currency + localCurrency,
          clicks: (prevState.clicks || 0) + localClicks
        }));

        // Reset local buffer
        setLocalCurrency(0);
        setLocalClicks(0);
      }
    }, 1000);

    return () => clearInterval(syncInterval.current);
  }, [localCurrency, localClicks, setGameState]);

  // Update currencyText only when currency changes
  useEffect(() => {
    for (const level of currencyLevels.currencyLevels) {
      if (currency >= level.min) {
        setCurrencyText(level.text);
      }
    }
  }, [currency]);

  // Increment currency and clicks (only local state, not global gameState)
  const incrementCurrency = () => {
    const earnedCurrency = gameState.level || 1; // Earn currency based on player level
    setLocalCurrency((prev) => prev + earnedCurrency);
    setLocalClicks((prev) => prev + 1);
    setCurrency((prev) => prev + earnedCurrency); // Update displayed currency
  };

  // Clear local and game state currency (for development only)
  const clearCurrency = () => {
    console.log('Clearing currency for testing purposes');
    setCurrency(0);
    setLocalCurrency(0);
    setGameState((prevState) => ({ ...prevState, currency: 0 }));
  };

  // Determine which currency image to display based on the amount of currency
  const getCurrencyImage = () => {
    let selectedImage = currencyLevels.currencyLevels[0].image;
    for (const level of currencyLevels.currencyLevels) {
      if (currency >= level.min) {
        selectedImage = require(`../../assets/images/currency/${level.image}`);
      }
    }
    return selectedImage;
  };

  // Format currency with commas
  const formatCurrency = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div className={styles.currencyContainer}>
      <img src={getCurrencyImage()} alt="Currency Icon" className={styles.currencyIcon} />
      <div className={styles.currencyDetails}>
        <h3 className={currency >= currencyLevels.highCurrencyThreshold ? styles.currencyAmountHigh : ''}>
          Currency: {formatCurrency(currency)} ({currencyText})
        </h3>
        <h4>Income: {formatCurrency(totalIncome)}/gold sec</h4>
      </div>
      <div className={styles.currencyButtonContainer}>
        <button onClick={incrementCurrency} className={styles.currencyButton}>Earn Currency</button>
        <button onClick={clearCurrency} className={`${styles.currencyButton} ${styles.clearButton}`}>Clear All [Dev]</button>
      </div>
    </div>
  );
}

export default Currency;
