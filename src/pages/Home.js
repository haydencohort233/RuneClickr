// /src/pages/Home.js
import React, { useState } from 'react';
import Currency from '../components/currency/currency';
import GameSaves from '../components/gamesaves/gameSaves';
import Login from '../components/users/Login';
import Logout from '../components/users/Logout';
import Buildings from '../components/buildings/buildings';
import Achievements from '../components/achievements/achievements';
import PlayerDetails from '../components/player/playerDetails';
import WorldMap from '../components/worldmap/worldMap';
import LocationDetails from '../components/locationdetails/locationDetails';
import Equipment from '../components/equipment/equipment';
import Inventory from '../components/inventory/inventory';
import worldLocations from '../components/worldmap/worldLocations.json';
import UI from '../components/ui/ui';
import Banking from '../components/banking/banking';

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
    }
  });

  const [userId, setUserId] = useState(null);

  // Get the current location details from worldLocations based on gameState
  const currentLocationDetails = worldLocations.find(
    (location) => location.id === gameState.currentLocation
  );

  //          <Inventory inventory={gameState.inventory} setPlayer={setGameState} maxInventorySpace={gameState.maxInventorySpace} />
  //          <Equipment gameState={gameState} setGameState={setGameState} />
  //          <WorldMap gameState={gameState} setGameState={setGameState} />
  //          <Banking gameState={gameState} setGameState={setGameState} />
  return (
    <div className="home">
      {userId ? (
        <>
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
          <LocationDetails currentLocation={currentLocationDetails} player={gameState} setPlayer={setGameState} />
          <Buildings gameState={gameState} setGameState={setGameState} />
          <Achievements gameState={gameState} setGameState={setGameState} userId={userId} />
        </>
      ) : (
        <Login setUserId={setUserId} />
      )}
    </div>
  );
}

export default Home;
