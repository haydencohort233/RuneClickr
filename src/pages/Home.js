// /src/pages/Home.js
import React, { useState } from 'react';
import Currency from '../components/currency/currency';
import GameSaves from '../components/gamesaves/gameSaves';
import Login from '../components/users/Login';
import Logout from '../components/users/Logout';
import Buildings from '../components/buildings/buildings';
import Achievements from '../components/achievements/achievements';
import PlayerDetails from '../components/player/playerDetails';
import LocationDetails from '../components/locationdetails/locationDetails';
import worldLocations from '../components/worldmap/worldLocations.json';
import UI from '../components/ui/ui';
import Skills from '../components/skills/skills';
import { gainExperience } from '../utils/skillUtils';
import LevelUpPopup from '../components/ui/LevelUpPopup';

function Home() {
  // Initial gameState values and arrays
  const [gameState, setGameState] = useState({
    username: 'Unknown Player',
    level: 1,
    experience: 0,
    hitpoints: 100,
    maxHitPoints: 100,
    inventory: [],
    maxInventorySpace: 30,
    bank: [],
    bankSpacesBought: 0,
    bankSpace: 30,
    currentLocation: 'spawn',
    currency: 0,
    buildings: [],
    clicks: 0,
    achievements: [],
    equipment: {
      head: null,
      neck: null,
      chest: null,
      legs: null,
      feet: null,
      fingers: [null, null],
      gloves: null,
      primaryHand: null,
    },
    skills: {
      cooking: { level: 1, experience: 0 },
      gathering: { level: 1, experience: 0 }
    },
  });

  const [userId, setUserId] = useState(null);
  const [levelUpMessage, setLevelUpMessage] = useState(null);

  // Get the current location details from worldLocations based on gameState
  const currentLocationDetails = worldLocations.find(
    (location) => location.id === gameState.currentLocation
  );

  const handleGainExperience = (skillName, exp) => {
    gainExperience(gameState, setGameState, skillName, exp, setLevelUpMessage);
  };  

  return (
    <div className="home">
      {userId ? (
        <>
          {levelUpMessage && (
            <LevelUpPopup
              message={levelUpMessage}
              onClose={() => setLevelUpMessage(null)}
            />
          )}
          <UI 
            inventory={gameState.inventory} 
            setPlayer={setGameState} 
            maxInventorySpace={gameState.maxInventorySpace}
            gameState={gameState} 
            setGameState={setGameState}
          />
          <Logout setUserId={setUserId} />
          <GameSaves userId={userId} gameState={gameState} setGameState={setGameState} />
          <Currency gameState={gameState} setGameState={setGameState} />
          <PlayerDetails player={gameState} setPlayer={setGameState} />
          <LocationDetails 
            currentLocation={currentLocationDetails} 
            player={gameState} 
            setPlayer={setGameState}
            gainExperience={handleGainExperience} 
            setLevelUpMessage={setLevelUpMessage} 
          />
          <Buildings gameState={gameState} setGameState={setGameState} />
          <Skills skills={gameState.skills} gainExperience={handleGainExperience} />
          <Achievements gameState={gameState} setGameState={setGameState} userId={userId} />
        </>
      ) : (
        <Login setUserId={setUserId} />
      )}
    </div>
  );
}

export default Home;
