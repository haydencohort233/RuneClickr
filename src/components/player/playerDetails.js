// /src/components/player/playerDetails.js
import React from 'react';
import styles from './playerDetails.module.css';

function PlayerDetails({ player, setPlayer }) {
  // Check if player data is available before rendering
  if (!player) {
    return <div className={styles.playerDetailsContainer}>Loading player details...</div>;
  }

  const { username, level, experience, hitpoints, maxHitPoints, currentLocation } = player;

  // Handlers for increasing level and decreasing hitpoints
  const increaseLevel = () => {
    setPlayer((prevPlayer) => ({
      ...prevPlayer,
      level: prevPlayer.level + 1,
    }));
  };

  const decreaseHitpoints = () => {
    setPlayer((prevPlayer) => ({
      ...prevPlayer,
      hitpoints: Math.max(prevPlayer.hitpoints - 10, 0), // Ensure hitpoints don't go below 0
    }));
  };

  return (
    <div className={styles.playerDetailsContainer}>
      <h2>Player Details</h2>
      <p><strong>Username:</strong> {username}</p>
      <p><strong>Level:</strong> {level} <button className={styles.smallButton} onClick={increaseLevel}>+1 Level</button></p>
      <p><strong>Experience:</strong> {experience}</p>
      <p><strong>Hitpoints:</strong> {hitpoints} / {maxHitPoints} <button className={styles.smallButton} onClick={decreaseHitpoints}>-10 HP</button></p>
      <p><strong>Current Location:</strong> {currentLocation}</p>
    </div>
  );
}

export default PlayerDetails;
