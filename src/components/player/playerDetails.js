import React, { useEffect, useMemo } from 'react';
import styles from './playerDetails.module.css';
import playerLevels from './playerLevel.json';
import playerStats from './playerStats.json';

// Import images statically
import player_100 from '../../assets/images/player/player_100.png';
import player_75 from '../../assets/images/player/player_75.png';
import player_50 from '../../assets/images/player/player_50.png';
import player_25 from '../../assets/images/player/player_25.png';
import hitpoints_100 from '../../assets/images/player/hitpoints_100.png';
import hitpoints_75 from '../../assets/images/player/hitpoints_75.png';
import hitpoints_50 from '../../assets/images/player/hitpoints_50.png';
import hitpoints_25 from '../../assets/images/player/hitpoints_25.png';
import levelIcon from '../../assets/images/player/level.png';
import expIcon from '../../assets/images/player/exp.png';
import mapIcon from '../../assets/images/player/map.png';

function PlayerDetails({ player, setPlayer }) {
  // Ensure that player data is defined before rendering
  const { level, experience, hitpoints, maxHitPoints, currentLocation } = player || {};

  // Check if player can level up based on experience
  useEffect(() => {
    let currentLevel = level;
    let currentExperience = experience;

    while (true) {
      const nextLevelInfo = playerLevels.levels.find(levelInfo => levelInfo.level === currentLevel + 1);
      if (!nextLevelInfo || currentExperience < nextLevelInfo.expRequired) break;

      currentLevel += 1;
      const newLevelStats = playerStats.levelStats.find(stats => stats.level === currentLevel);
      if (newLevelStats) {
        setPlayer(prevPlayer => ({
          ...prevPlayer,
          level: currentLevel,
          health: newLevelStats.health,
          attackPower: newLevelStats.attackPower,
          defencePower: newLevelStats.defencePower,
          maxHitPoints: newLevelStats.health, // Update max hitpoints when leveling up
          hitpoints: newLevelStats.health // Restore health to max on level up
        }));
      }
    }
  }, [experience, level, setPlayer]);

  const playerImage = useMemo(() => {
    const healthPercentage = maxHitPoints ? (hitpoints / maxHitPoints) * 100 : 0;
    if (healthPercentage > 75) return player_100;
    if (healthPercentage > 50) return player_75;
    if (healthPercentage > 25) return player_50;
    return player_25;
  }, [hitpoints, maxHitPoints]);

  const hitpointsImage = useMemo(() => {
    const healthPercentage = maxHitPoints ? (hitpoints / maxHitPoints) * 100 : 0;
    if (healthPercentage > 75) return hitpoints_100;
    if (healthPercentage > 50) return hitpoints_75;
    if (healthPercentage > 25) return hitpoints_50;
    return hitpoints_25;
  }, [hitpoints, maxHitPoints]);

  const experiencePercentage = useMemo(() => {
    const nextLevelInfo = playerLevels.levels.find(levelInfo => levelInfo.level === level + 1);
    if (nextLevelInfo) {
      return (experience / nextLevelInfo.expRequired) * 100;
    }
    return 100; // If max level, return 100%
  }, [experience, level]);

  const nextLevelExp = useMemo(() => {
    const nextLevelInfo = playerLevels.levels.find(levelInfo => levelInfo.level === level + 1);
    if (nextLevelInfo) {
      return `EXP ${experience} / ${nextLevelInfo.expRequired}`;
    }
    return `${experience} / MAX EXP`; // If max level, show max
  }, [experience, level]);

  return (
    <div className={styles.playerDetailsContainer}>
      {player ? (
        <>
          <div className={styles.playerImageContainer}>
            <img src={playerImage} alt="Player Icon" className={styles.playerImage} />
          </div>
          <hr className={styles.imageBreakLine} />
          <div className={styles.levelContainer}>
            <div className={styles.iconAligned}>
              <img
                src={levelIcon}
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
                src={expIcon}
                alt="Experience"
                className={styles.expImage}
                title="Experience"
              />
              <span className={styles.iconText}>{nextLevelExp}</span>
            </div>
          </div>
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBar}>
              <div
                className={styles.progress}
                style={{ width: `${experiencePercentage}%` }}
              ></div>
            </div>
          </div>
          <div className={styles.hitpointsContainer}>
            <div className={styles.iconAligned}>
              <img
                src={hitpointsImage}
                alt="Hitpoints"
                className={styles.hitpointsImage}
                title="Hitpoints"
              />
            </div>
            <span className={styles.iconText}><strong>Health</strong> {hitpoints} / {maxHitPoints}</span>
          </div>
          <div className={styles.currentLocationContainer}>
            <div className={styles.iconAligned}>
              <img
                src={mapIcon}
                alt="Current Location"
                className={styles.mapImage}
                title="Current Location"
              />
            </div>
            <span className={styles.iconText}><strong>Location:</strong> {currentLocation}</span>
          </div>
        </>
      ) : (
        <div>Loading player details...</div>
      )}
    </div>
  );  
}

export default PlayerDetails;
