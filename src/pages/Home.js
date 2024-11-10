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
import worldLocations from '../components/worldmap/worldLocations.json';

function Home() {
  // Initial gameState values and arrays
  const [gameState, setGameState] = useState({
    username: 'Unknown Player',
    level: 1,
    experience: 0,
    hitpoints: 100,
    maxHitPoints: 100,
    currentLocation: 'spawn',
    currency: 0,
    buildings: [],
    clicks: 0,
    achievements: [],
  });

  const [userId, setUserId] = useState(null);

  // Get the current location details from worldLocations based on gameState
  const currentLocationDetails = worldLocations.find(
    (location) => location.id === gameState.currentLocation
  );

  return (
    <div className="home">
      {userId ? (
        <>
          <PlayerDetails player={gameState} setPlayer={setGameState} />
          <Logout setUserId={setUserId} />
          <Currency gameState={gameState} setGameState={setGameState} />
          <GameSaves userId={userId} gameState={gameState} setGameState={setGameState} />
          <LocationDetails currentLocation={currentLocationDetails} />
          <Buildings gameState={gameState} setGameState={setGameState} />
          <WorldMap gameState={gameState} setGameState={setGameState} />
          <Achievements gameState={gameState} setGameState={setGameState} userId={userId} />
        </>
      ) : (
        <Login setUserId={setUserId} />
      )}
    </div>
  );
}

export default Home;
