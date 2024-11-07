// /src/components/achievements/achievements.js
import React, { useEffect, useState } from 'react';
import styles from './achievements.module.css';
import achievementData from './achievements-list.json';

function Achievements({ gameState, setGameState }) {
  const [achievements, setAchievements] = useState({});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Load achievements from JSON
    const achievementList = achievementData;

    // Initialize achievements in gameState if not already present
    if (!gameState.achievements) {
      setGameState((prevState) => ({
        ...prevState,
        achievements: achievementList.reduce((acc, achievement) => {
          acc[achievement.id] = false;
          return acc;
        }, {}),
      }));
      return; // Exit early if achievements were not initialized yet
    }

    // Check for completed achievements
    const unlockedAchievements = achievementList.filter((achievement) => {
      switch (achievement.conditionType) {
        case "currency-based":
          return gameState.currency >= achievement.threshold;
        case "level-based":
          return gameState.level >= achievement.threshold;
        case "building-based":
          return (
            gameState.buildings &&
            Object.values(gameState.buildings).reduce((acc, building) => acc + building.count, 0) >= achievement.threshold
          );
        case "specific-building":
          return gameState.buildings && gameState.buildings[achievement.buildingName]?.count >= 1;
        case "click-based":
          return gameState.clicks >= achievement.threshold;
        case "travel-based":
          return gameState.travel_count >= achievement.threshold;
        default:
          return false;
      }
    });

    // Update local achievements state
    const updatedAchievements = { ...gameState.achievements };
    unlockedAchievements.forEach((achievement) => {
      if (!updatedAchievements[achievement.id]) {
        console.log(`Achievement unlocked: ${achievement.name}`); // Log when an achievement is unlocked
        updatedAchievements[achievement.id] = true;
        setNotification(`Achievement unlocked: ${achievement.name}`); // Set notification message
        setTimeout(() => setNotification(null), 3000); // Remove notification after 3 seconds
      }
    });

    setAchievements(updatedAchievements);

    // Update gameState with only newly unlocked achievements
    if (unlockedAchievements.some((achievement) => !gameState.achievements[achievement.id])) {
      setGameState((prevState) => ({
        ...prevState,
        achievements: updatedAchievements,
      }));
    }
  }, [gameState, setGameState]);

  // Dev Button to clear all achievements
  const clearAllAchievements = () => {
    console.log('Clearing all achievements for testing purposes');
    const clearedAchievements = Object.keys(gameState.achievements).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {});
    setAchievements(clearedAchievements);
    setGameState((prevState) => ({
      ...prevState,
      achievements: clearedAchievements,
    }));
  };

  return (
    <div className={styles.achievementsContainer}>
      <h2>Achievements</h2>
      <div className={styles.achievementList}>
        {Object.keys(achievements).map((key) => (
          <div
            key={key}
            className={
              achievements[key]
                ? `${styles.achievementItem} ${styles.achieved}`
                : styles.achievementItem
            }
          >
            <h3>{achievementData.find((ach) => ach.id === key)?.name}</h3>
            <p>{achievementData.find((ach) => ach.id === key)?.description}</p>
          </div>
        ))}
      </div>
      <button onClick={clearAllAchievements} className={`${styles.achievementButton} ${styles.devButton}`}>Clear All Achievements (Dev Button)</button>
      {notification && <div className={styles.notification}>{notification}</div>}
    </div>
  );
}

export default Achievements;
