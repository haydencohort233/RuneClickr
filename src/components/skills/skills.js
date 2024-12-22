import React from 'react';
import styles from './skills.module.css';
import levels from '../skills/levels.json';

function Skills({ skills, gainExperience, totalSkillExp }) {
  const formatNumber = (number) => {
    return number.toLocaleString(); // Format numbers with commas
  };

  const getIcon = (skillName) => {
    try {
      return require(`../../assets/images/icons/${skillName}.png`);
    } catch {
      return require('../../assets/images/icons/fallback.png'); // Fallback icon
    }
  };

  return (
    <div className={styles.skillsContainer}>
      {Object.entries(skills).map(([skillName, skillData]) => {
        const nextLevelExp = levels[skillData.level + 1] ?? Infinity; // Total EXP required for the next level
        const currentLevelExp = levels[skillData.level] ?? 0; // Ensure 0 if undefined
        const expForNextLevel = nextLevelExp - currentLevelExp; // Total EXP needed for the next level
        const relativeExp = Math.max(0, (skillData.experience || 0) - currentLevelExp); // Default to 0 if undefined
        const experiencePercentage = Math.min((relativeExp / expForNextLevel) * 100, 100); // Progress percentage

        return (
          <div key={skillName} className={styles.skillRow}>
            <img 
              src={getIcon(skillName)} 
              alt={skillName} 
              className={styles.skillIcon}
              title={skillName.charAt(0).toUpperCase() + skillName.slice(1)}
            />
            <div className={styles.skillDetails}>
              <div className={styles.levelInfo}>
                <span className={styles.currentLevel}>LV. {skillData.level}</span>
                <span className={styles.nextLevel}>LV. {skillData.level + 1}</span>
              </div>
              <div className={styles.progressBarContainer}>
                <div
                  className={styles.progressBar}
                  style={{ width: `${experiencePercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
      <h3 className={styles.totalExperience}>Total Experience: {formatNumber(totalSkillExp)} EXP</h3>
    </div>
  );
}

export default Skills;
