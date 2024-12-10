// /src/components/ui/LevelUpPopup.js
import React from 'react';
import styles from './LevelUpPopup.module.css';

function LevelUpPopup({ message, onClose }) {
  return (
    <div className={styles.popup}>
      <div className={styles.popupContent}>
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default LevelUpPopup;
