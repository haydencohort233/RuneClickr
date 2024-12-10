import React from 'react';
import styles from './skills.module.css';

function Skills({ skills, gainExperience }) {
  return (
    <div className={styles.skillsContainer}>
      {Object.keys(skills).map((skill) => (
        <div key={skill} className={styles.skill}>
          <h3>{skill.charAt(0).toUpperCase() + skill.slice(1)}</h3>
          <p>Level: {skills[skill].level}</p>
          <p>Experience: {skills[skill].experience}</p>
          <button onClick={() => gainExperience(skill, 50)}>Gain 50 EXP (Dev)</button>
        </div>
      ))}
    </div>
  );
}

export default Skills;
