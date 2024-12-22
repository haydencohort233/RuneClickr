import React, { useState } from 'react';
import skills from '../components/skills/skills.json';
import Currency from '../components/currency/currency';
import Login from '../components/users/Login';
import Logout from '../components/users/Logout';
import Buildings from '../components/buildings/buildings';
import Achievements from '../components/achievements/achievements';
import LocationDetails from '../components/locationdetails/locationDetails';
import UI from '../components/ui/ui';
import LevelUpPopup from '../components/ui/LevelUpPopup';
import { handleLevelUp } from '../utils/levelUp';

function Home() {
    const [userId, setUserId] = useState(null);
    const [levelUpMessage, setLevelUpMessage] = useState(null);
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
        ...skills // Load skills from skills.json
      }
    });

    const handleGainExperience = (skillName, exp) => {
      setGameState((prevState) => {
        const currentSkill = prevState.skills[skillName];
        const updatedSkill = { 
          ...currentSkill, 
          experience: currentSkill.experience + exp
        };
    
        const { level, leveledUp, message } = handleLevelUp(skillName, updatedSkill);
        
        if (leveledUp) {
          setLevelUpMessage(message);
        }
    
        const updatedSkills = {
          ...prevState.skills,
          [skillName]: { ...updatedSkill, level }
        };
    
        const totalSkillExp = Object.values(updatedSkills).reduce(
          (total, skill) => total + skill.experience, 
          0
        );
    
        return {
          ...prevState,
          skills: updatedSkills,
          totalSkillExp // Update total experience
        };
      });
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
              userId={userId}
            />
            <Logout setUserId={setUserId} />
            <Currency gameState={gameState} setGameState={setGameState} />
            <LocationDetails 
              currentLocation={gameState.currentLocation} 
              player={gameState} 
              setPlayer={setGameState}
              gainExperience={handleGainExperience} 
              setLevelUpMessage={setLevelUpMessage} 
            />
            <Buildings gameState={gameState} setGameState={setGameState} />
            <Achievements gameState={gameState} setGameState={setGameState} userId={userId} />
          </>
        ) : (
          <Login setUserId={setUserId} setGameState={setGameState} />
        )}
      </div>
    );
}

export default Home;
