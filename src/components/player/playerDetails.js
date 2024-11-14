import React, { useEffect } from 'react';
import styles from './playerDetails.module.css';
import playerLevels from './playerLevel.json'; // Import player level configuration
import playerStats from './playerStats.json'; // Import player stats configuration

function PlayerDetails({ player, setPlayer }) {
  // Ensure that player data is defined before rendering
  const { username, level, experience, hitpoints, maxHitPoints, currentLocation } = player || {};

  // Check if player can level up based on experience
  useEffect(() => {
    const nextLevelInfo = playerLevels.levels.find(levelInfo => levelInfo.level === level + 1);
    if (nextLevelInfo && experience >= nextLevelInfo.expRequired) {
      const newLevel = level + 1;

      // Find the stats for the new level from playerStats.json
      const newLevelStats = playerStats.levelStats.find(stats => stats.level === newLevel);

      if (newLevelStats) {
        setPlayer((prevPlayer) => ({
          ...prevPlayer,
          level: newLevel,
          health: newLevelStats.health,
          attackPower: newLevelStats.attackPower,
          defencePower: newLevelStats.defencePower,
          maxHitPoints: newLevelStats.health, // Update max hitpoints as well when leveling up
          hitpoints: newLevelStats.health // Restore health to maximum on level up
        }));
      }
    }
  }, [experience, level, setPlayer]);

  // Determine the correct player image based on hitpoints percentage
  const getPlayerImage = () => {
    const healthPercentage = (hitpoints / maxHitPoints) * 100;

    if (healthPercentage > 75) {
      return require('../../assets/images/player/player_100.png');
    } else if (healthPercentage > 50) {
      return require('../../assets/images/player/player_75.png');
    } else if (healthPercentage > 25) {
      return require('../../assets/images/player/player_50.png');
    } else {
      return require('../../assets/images/player/player_25.png');
    }
  };

  // Determine the correct hitpoints image based on hitpoints percentage
  const getHitpointsImage = () => {
    const healthPercentage = (hitpoints / maxHitPoints) * 100;

    if (healthPercentage > 75) {
      return require('../../assets/images/player/hitpoints_100.png');
    } else if (healthPercentage > 50) {
      return require('../../assets/images/player/hitpoints_75.png');
    } else if (healthPercentage > 25) {
      return require('../../assets/images/player/hitpoints_50.png');
    } else {
      return require('../../assets/images/player/hitpoints_25.png');
    }
  };

  // Calculate progress bar percentage
  const getExperiencePercentage = () => {
    const nextLevelInfo = playerLevels.levels.find(levelInfo => levelInfo.level === level + 1);
    if (nextLevelInfo) {
      return (experience / nextLevelInfo.expRequired) * 100;
    }
    return 100; // If max level, return 100%
  };

  // Calculate experience till next level
  const getNextLevelExp = () => {
    const nextLevelInfo = playerLevels.levels.find(levelInfo => levelInfo.level === level + 1);
    if (nextLevelInfo) {
      return `${experience} / ${nextLevelInfo.expRequired} EXP`;
    }
    return `${experience} / MAX EXP`; // If max level, show max
  };

  return (
    <div className={styles.playerDetailsContainer}>
      {player ? (
        <>
          <img src={getPlayerImage()} alt="Level Icon" className={styles.playerImage} />
          <div className={styles.levelContainer}>
            <div className={styles.iconAligned}>
              <img 
                src={require('../../assets/images/player/level.png')} 
                alt="Level" 
                className={styles.levelImage} 
                title="Level"
              />
              <p><strong>Level:</strong> {level}</p>
            </div>
          </div>
          <div className={styles.experienceContainer}>
            <div className={styles.iconAligned}>
              <img 
                src={require('../../assets/images/player/exp.png')} 
                alt="Experience"
                className={styles.expImage}
                title="Experience"
              />
              <span className={styles.iconText}>{getNextLevelExp()}</span>
            </div>
          </div>
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBar}>
              <div
                className={styles.progress}
                style={{ width: `${getExperiencePercentage()}%` }}
              ></div>
            </div>
          </div>
          <div className={styles.hitpointsContainer}>
            <div className={styles.iconAligned}>
              <img 
                src={getHitpointsImage()} 
                alt="Hitpoints"
                className={styles.hitpointsImage}
                title="Hitpoints"
              />
            </div>
            <span className={styles.iconText}>{hitpoints} / {maxHitPoints}</span>
          </div>
          <div className={styles.currentLocationContainer}>
            <div className={styles.iconAligned}>
              <img 
                src={require('../../assets/images/player/map.png')} 
                alt="Current Location"
                className={styles.mapImage}
                title="Current Location"
              />
            </div>
            <span className={styles.iconText}><strong>Current Location:</strong> {currentLocation}</span>
          </div>
        </>
      ) : (
        <div>Loading player details...</div>
      )}
    </div>
  );
}

export default PlayerDetails;
