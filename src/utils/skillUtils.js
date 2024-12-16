import { handleLevelUp } from './levelUp';

export const gainExperience = (gameState, setGameState, skillName, exp, setLevelUpMessage) => {
  // Check if skillName is a valid string
  if (typeof skillName !== 'string') {
    console.error(`Invalid skillName provided. Expected a string but received:`, skillName);
    console.trace(); // Show where the call came from
    return;
  }

  console.log(`gainExperience called with skillName: ${skillName}, exp: ${exp}`);
  
  setGameState((prevState) => {
    console.log('Current gameState before experience gain:', prevState);

    if (!prevState.skills) {
      console.error(`Skills object does not exist in the gameState.`);
      return prevState; 
    }

    if (!prevState.skills[skillName]) {
      console.error(`Skill "${skillName}" does not exist in the gameState.`);
      return prevState; 
    }

    const updatedSkill = { ...prevState.skills[skillName] };
    updatedSkill.experience += exp;

    const { level, experience, leveledUp, message } = handleLevelUp(skillName, updatedSkill);
    updatedSkill.level = level;
    updatedSkill.experience = experience;

    if (leveledUp && setLevelUpMessage) {
      setLevelUpMessage(message);
    }

    return {
      ...prevState,
      skills: {
        ...prevState.skills,
        [skillName]: updatedSkill,
      },
    };
  });
};
