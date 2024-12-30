import styles from './combatLog.module.css';

const CombatLog = ({ log }) => {
    return (
        <div className={styles.log}>
            {log.map((entry, index) => (
                <p key={index} className={styles.entry}>{entry}</p>
            ))}
        </div>
    );
};

export default CombatLog;
