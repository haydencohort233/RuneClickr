// /src/pages/Home.js
import React, { useState } from 'react';
import Currency from '../components/currency/currency';
import GameSaves from '../components/gamesaves/gameSaves';
import Login from '../components/users/Login';
import Logout from '../components/users/Logout';
import Buildings from '../components/buildings/buildings';
import Achievements from '../components/achievements/achievements';

function Home() {
  const [gameState, setGameState] = useState({
    currency: 0, // Initial currency value
    buildings: [], // Initial buildings array
    clicks: 0,
    achievements: [], // Initial achievements array
  });
  const [userId, setUserId] = useState(null);

  return (
    <div className="home">
      {userId ? (
        <>
          <Logout setUserId={setUserId} />
          <Currency gameState={gameState} setGameState={setGameState} />
          <GameSaves userId={userId} gameState={gameState} setGameState={setGameState} />
          <Buildings gameState={gameState} setGameState={setGameState} />
          <Achievements gameState={gameState} setGameState={setGameState} />
        </>
      ) : (
        <Login setUserId={setUserId} />
      )}
    </div>
  );
}

export default Home;
