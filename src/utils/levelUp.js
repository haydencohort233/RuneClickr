import levels from '../components/skills/levels.json';

export const handleLevelUp = (skillName, skillDetails) => {
  const nextLevelExp = levels[skillDetails.level + 1] ?? Infinity;

  if (skillDetails.experience >= nextLevelExp) {
    return {
      level: skillDetails.level + 1,
      leveledUp: true,
      message: `Congratulations! You've leveled up ${skillName} to Level ${skillDetails.level + 1}!`
    };
  }

  return {
    ...skillDetails,
    leveledUp: false,
  };
};
