import React, { useState } from 'react';
import styles from './ui.module.css';
import Inventory from '../inventory/inventory';
import Equipment from '../equipment/equipment';
import WorldMap from '../worldmap/worldMap';

function UI({ inventory, setPlayer, maxInventorySpace, gameState, setGameState }) {
  const [activeComponent, setActiveComponent] = useState(null);

  const handleInventoryToggle = () => {
    setActiveComponent(activeComponent === 'inventory' ? null : 'inventory');
  };

  const handleEquipmentToggle = () => {
    setActiveComponent(activeComponent === 'equipment' ? null : 'equipment');
  };

  const handleWorldMapToggle = () => {
    setActiveComponent(activeComponent === 'worldMap' ? null : 'worldMap');
  };

  return (
    <div>
      <div className={styles.uiContainer}>
        <button className={styles.uiButton} onClick={handleInventoryToggle}>Inventory</button>
        <button className={styles.uiButton} onClick={handleEquipmentToggle}>Equipment</button>
        <button className={styles.uiButton} onClick={handleWorldMapToggle}>
          World Map ({gameState.currentLocation})
        </button>
      </div>
      {activeComponent === 'inventory' && (
        <div className={`${styles.inventoryOverlay} ${styles.open}`}>
          <Inventory 
            inventory={inventory} 
            setPlayer={setPlayer} 
            maxInventorySpace={maxInventorySpace} 
            gameState={gameState}
            setGameState={setGameState}
          />
        </div>
      )}
      {activeComponent === 'equipment' && (
        <div className={`${styles.equipmentOverlay} ${styles.open}`}>
          <Equipment 
            gameState={gameState}
            setGameState={setGameState}
          />
        </div>
      )}
      {activeComponent === 'worldMap' && (
        <div className={`${styles.worldMapOverlay} ${styles.open}`}>
          <WorldMap 
            gameState={gameState}
            setGameState={setGameState}
          />
        </div>
      )}
    </div>
  );
}

export default UI;
