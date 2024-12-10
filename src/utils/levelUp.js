// /src/utils/levelUp.js
export const handleLevelUp = (skillName, skillDetails) => {
    const expToLevel = skillDetails.level * 100; // Example formula
  
    if (skillDetails.experience >= expToLevel) {
      return {
        level: skillDetails.level + 1,
        experience: skillDetails.experience - expToLevel,
        leveledUp: true,
        message: `Congratulations! You've leveled up ${skillName} to Level ${skillDetails.level + 1}!`
      };
    }
  
    return {
      ...skillDetails,
      leveledUp: false,
    };
  };
  