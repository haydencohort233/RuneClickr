// /src/utils/skillUtils.js
import { handleLevelUp } from './levelUp';

export const gainExperience = (gameState, setGameState, skillName, exp, setLevelUpMessage) => {
  console.log(`gainExperience called with skillName: ${skillName}, exp: ${exp}`);
  setGameState((prevState) => {
    console.log('Current gameState before experience gain:', prevState);
    // Check if skills is defined
    if (!prevState.skills || !prevState.skills[skillName]) {
      console.error(`Skill ${skillName} does not exist in the gameState.`);
      return prevState; // Return current state if skills are not properly set
    }

    // Update skill experience
    const updatedSkill = { ...prevState.skills[skillName] };
    updatedSkill.experience += exp;
    console.log(`Updated skill experience for ${skillName}:`, updatedSkill.experience);

    // Handle level-up logic
    const { level, experience, leveledUp, message } = handleLevelUp(skillName, updatedSkill);
    updatedSkill.level = level;
    updatedSkill.experience = experience;

    console.log(`After handleLevelUp - level: ${level}, experience: ${experience}, leveledUp: ${leveledUp}`);

    // If level up occurs, trigger level up message using setLevelUpMessage
    if (leveledUp && setLevelUpMessage) {
      console.log('Level up occurred, setting level up message:', message);
      setLevelUpMessage(message);
    }

    // Return updated state
    const updatedState = {
      ...prevState,
      skills: {
        ...prevState.skills,
        [skillName]: updatedSkill,
      },
    };
    console.log('Updated gameState after experience gain:', updatedState);
    return updatedState;
  });
};
