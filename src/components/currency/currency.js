import React, { useState, useEffect } from 'react';
import buildingStats from '../buildings/building-stats.json';
import styles from './currency.module.css';
import currencyLevels from './currencyLevels.json';

function Currency({ gameState, setGameState = () => {} }) {
  const [currency, setCurrency] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [currencyText, setCurrencyText] = useState('');

  // Load currency from gameState when component mounts
  useEffect(() => {
    if (gameState && gameState.currency !== undefined) {
      setCurrency(gameState.currency);
    }
  }, [gameState]);

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
  }, [gameState, gameState.buildings]);

  // Update gameState whenever currency changes
  useEffect(() => {
    if (typeof setGameState === 'function') {
      setGameState(prevState => ({
        ...prevState,
        currency: currency
      }));
    }
    // Update currency text and image when currency changes
    for (const level of currencyLevels.currencyLevels) {
      if (currency >= level.min) {
        setCurrencyText(level.text);
      }
    }
  }, [currency, setGameState, currencyLevels.currencyLevels]);

  // Function to increment currency and track clicks and gain experience
  const incrementCurrency = () => {
    const earnedCurrency = gameState.level || 1; // Earn currency based on player level
    setCurrency((prevCurrency) => prevCurrency + earnedCurrency);
    setGameState((prevState) => ({
      ...prevState,
      clicks: (prevState.clicks || 0) + 1, // Increment clicks count
      experience: (prevState.experience || 0) + 1, // Gain 1 EXP per click
    }));
  };  

  // Function to clear currency
  const clearCurrency = () => {
    console.log('Clearing currency for testing purposes');
    setCurrency(0);
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
        <button onClick={clearCurrency} className={`${styles.currencyButton} ${styles.clearButton}`}>Clear Currency [Dev]</button>
      </div>
    </div>
  );
}

export default Currency;
