import React, { useState } from 'react';
import styles from './ui.module.css';
import Inventory from '../inventory/inventory';
import Equipment from '../equipment/equipment';
import WorldMap from '../worldmap/worldMap';
import PlayerDetails from '../player/playerDetails';
import GameSaves from '../gamesaves/gameSaves';

function UI({ inventory, setPlayer, maxInventorySpace, gameState, setGameState, userId }) {
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
      <div className={styles.playerDetailsContainer}>
        <PlayerDetails
          player={gameState}
          setPlayer={setGameState}
          className={styles.playerDetails}
        />
        <GameSaves
          userId={userId}
          gameState={gameState}
          setGameState={setGameState}
          className={styles.gameSaves}
        />
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
            onClose={() => setActiveComponent(null)}
          />
        </div>
      )}
    </div>
  );
}

export default UI;
