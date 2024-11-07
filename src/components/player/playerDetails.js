import React, { useEffect } from 'react';
import styles from './playerDetails.module.css';
import playerLevels from './playerLevel.json'; // Import player level configuration

function PlayerDetails({ player, setPlayer }) {
  // Ensure that player data is defined before rendering
  const { username, level, experience, hitpoints, maxHitPoints, currentLocation } = player || {};

  // Handlers for increasing level and decreasing hitpoints
  const increaseLevel = () => {
    setPlayer((prevPlayer) => ({
      ...prevPlayer,
      level: prevPlayer.level + 1,
    }));
  };

  const decreaseLevel = () => {
    setPlayer((prevPlayer) => ({
      ...prevPlayer,
      level: prevPlayer.level - 1,
    }));
  };

  const increaseHitpoints = () => {
    setPlayer((prevPlayer) => ({
      ...prevPlayer,
      hitpoints: Math.max(prevPlayer.hitpoints + 10, 0),
    }));
  };

  const decreaseHitpoints = () => {
    setPlayer((prevPlayer) => ({
      ...prevPlayer,
      hitpoints: Math.max(prevPlayer.hitpoints - 10, 0), // Ensure hitpoints don't go below 0
    }));
  };

  // Check if player can level up based on experience
  useEffect(() => {
    const nextLevelInfo = playerLevels.levels.find(levelInfo => levelInfo.level === level + 1);
    if (nextLevelInfo && experience >= nextLevelInfo.expRequired) {
      setPlayer((prevPlayer) => ({
        ...prevPlayer,
        level: prevPlayer.level + 1,
      }));
    }
  }, [experience, level, setPlayer]);

  return (
    <div className={styles.playerDetailsContainer}>
      {player ? (
        <>
          <p><strong>Username:</strong> {username}</p>
          <p><strong>Level:</strong> {level} <button className={styles.smallButton} onClick={increaseLevel}>+1 Level</button><button className={styles.smallButton} onClick={decreaseLevel}>-1 Level</button></p>
          <p><strong>Experience:</strong> {experience}</p>
          <button className={styles.smallButton} onClick={() => setPlayer((prevPlayer) => ({
            ...prevPlayer,
            experience: prevPlayer.experience + 100, // Gain 100 EXP
          }))}>Gain 100 EXP</button>
          <button className={styles.smallButton} onClick={() => setPlayer((prevPlayer) => ({
            ...prevPlayer,
            experience: prevPlayer.experience - 100, // Lose 100 EXP
          }))}>Lose 100 EXP</button>
          <p><strong>Hitpoints:</strong> {hitpoints} / {maxHitPoints} <button className={styles.smallButton} onClick={decreaseHitpoints}>-10 HP</button> <button className={styles.smallButton} onClick={increaseHitpoints}>+10 HP</button></p>
          <p><strong>Current Location:</strong> {currentLocation}</p>
        </>
      ) : (
        <div>Loading player details...</div>
      )}
    </div>
  );
}

export default PlayerDetails;
