import React, { useEffect, useRef } from 'react';
import HealthBar from './healthBar';
import CombatLog from './combatLog';
import styles from './combatUI.module.css';

const CombatUI = ({ player, enemy, combatLog, onAttack, isPlayerTurn, renderMagic, combatBackground }) => {
    const logContainerRef = useRef(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [combatLog]); // Auto-scroll when combatLog updates

    return (
        <div
            className={styles.combatUIContainer}
            style={{
                backgroundImage: `url(${combatBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Enemy Section */}
            <div className={styles.enemyContainer}>
                <h3 className={styles.enemyName}>{enemy.type}</h3>
                <img
                    src={enemy.image}
                    alt={enemy.type}
                    className={styles.enemyPhoto}
                    width="150"
                    height="100"
                />
                <HealthBar current={enemy.health} max={enemy.maxHealth} />
            </div>

            {/* Player Section */}
            <div className={styles.playerContainer}>
                <h3 className={styles.playerName}>{player.username}</h3>
                <HealthBar current={player.hitpoints} max={player.maxHitPoints} />
            </div>

            {/* Action Buttons */}
            <div className={styles.actionMenu}>
                {isPlayerTurn ? (
                    <>
                        <button className={styles.attackButton} onClick={onAttack}>Attack</button>
                        {renderMagic && renderMagic()}
                        <button className={styles.itemsButton} disabled>Items</button>
                        <button className={styles.runButton} disabled>Run</button> {/* Dummy Run Button */}
                    </>
                ) : (
                    <p>Enemy's Turn...</p>
                )}
            </div>

            {/* Combat Logs */}
            <div className={styles.combatLogContainer} ref={logContainerRef}>
                <CombatLog log={combatLog} />
            </div>
        </div>
    );
};

export default CombatUI;
