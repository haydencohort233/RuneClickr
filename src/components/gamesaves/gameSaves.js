// /src/components/gamesaves/gameSaves.js
import React, { useRef } from 'react';
import styles from './gameSaves.module.css';
import saveIcon from '../../assets/images/icons/save_game_state.png';
import loadIcon from '../../assets/images/icons/load_game_state.png';
import exportIcon from '../../assets/images/icons/export_game_state.png';
import importIcon from '../../assets/images/icons/import_game_state.png';

function GameSaves({ userId, gameState, setGameState }) {
  const fileInputRef = useRef(null);

  // Save the current game state to the server, including currency and last_active
  const saveGameToServer = async () => {
    try {
      const updatedGameState = {
        ...gameState,
        last_active: new Date().toISOString(), // Adding last_active timestamp
      };
      const response = await fetch('http://localhost:5000/api/save-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          gameState: updatedGameState,
        }),
      });
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error('Failed to save game to server:', error);
    }
  };

  // Load the game state from the server, including currency and last_active
  const loadGameFromServer = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/load-game/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const loadedGameState = data.gameState;

        // Update local state with loaded data
        setGameState((prevState) => ({
          ...prevState,
          ...loadedGameState,
        }));
        console.log('Game state loaded successfully:', loadedGameState);
      } else {
        console.error('No saved game found.');
      }
    } catch (error) {
      console.error('Failed to load game from server:', error);
    }
  };

  // Export the current game state as a JSON file, including all fields, and adding username and password for testing purposes
  const exportGameState = async () => {
    try {
      // Fetch user details (username and password) for export
      const response = await fetch(`http://localhost:5000/api/user-details/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        const exportState = {
          ...gameState,
          username: userData.username,
          password: userData.password, // For testing purposes only
          last_active: userData.last_active,
        };
        const jsonString = JSON.stringify(exportState, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'gameState.json';
        link.click();
      } else {
        console.error('Failed to fetch user details for export.');
      }
    } catch (error) {
      console.error('Failed to export game state:', error);
    }
  };

  // Import a saved game state from a JSON file
  const importGameState = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const importedGameState = JSON.parse(content);
      setGameState((prevState) => ({
        ...prevState,
        ...importedGameState,
      }));

      // Optionally, save imported game state to server
      saveGameToServer();
    };
    reader.readAsText(file);
  };

  // Trigger file input click
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={styles.gameSaves}>
      <div className={styles.buttonContainer}>
        <button onClick={saveGameToServer} className={styles.gameButton} title='Save Game to Server'>
          <img src={saveIcon} alt="Save Game" className={styles.icon} />
          Save
        </button>
        <button onClick={loadGameFromServer} className={styles.gameButton} title='Load Save from Server'>
          <img src={loadIcon} alt="Load Game" className={styles.icon} />
          Load
        </button>
        <button onClick={exportGameState} className={styles.gameButton} title='Export Game to Downloads'>
          <img src={exportIcon} alt="Export Game" className={styles.icon} />
          Export
        </button>
        <button onClick={handleImportClick} className={styles.gameButton} title='Import Game from Downloads'>
          <img src={importIcon} alt="Import Game" className={styles.icon} />
          Import
        </button>
        <input
          type="file"
          accept="application/json"
          onChange={importGameState}
          ref={fileInputRef}
          className={styles.fileInputHidden}
        />
      </div>
    </div>
  );
}

export default GameSaves;
