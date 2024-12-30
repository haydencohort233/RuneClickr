import styles from './healthBar.module.css';

const HealthBar = ({ current, max }) => {
    const percentage = Math.max(0, (current / max) * 100);
    const healthClass =
        percentage > 60 ? styles.inner :
        percentage > 30 ? `${styles.inner} ${styles.medium}` :
        `${styles.inner} ${styles.low}`;

    return (
        <div className={styles.bar}>
            <div className={healthClass} style={{ width: `${percentage}%` }} />
            <span className={styles.text}>{current} / {max}</span>
        </div>
    );
};

export default HealthBar;
