// /components/ui/ui.js
import React, { useState } from 'react';
import styles from './ui.module.css';
import Inventory from '../inventory/inventory';

function UI({ inventory, setPlayer, maxInventorySpace }) {
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  const handleInventoryToggle = () => {
    setIsInventoryOpen(!isInventoryOpen);
  };

  return (
    <div>
      <div className={styles.uiContainer}>
        <button className={styles.uiButton} onClick={handleInventoryToggle}>Inventory</button>
        <button className={styles.uiButton}>Button 2</button>
        <button className={styles.uiButton}>Button 3</button>
      </div>
      {isInventoryOpen && (
        <div className={styles.inventoryOverlay}>
          <Inventory 
            inventory={inventory} 
            setPlayer={setPlayer} 
            maxInventorySpace={maxInventorySpace} 
          />
        </div>
      )}
    </div>
  );
}

export default UI;
