import React, { useEffect, useRef, useState } from 'react';
import HealthBar from './healthBar';
import CombatLog from './combatLog';
import Spellbook from '../magic/Spellbook';
import spells from '../magic/spells.json';
import styles from './combatUI.module.css';

const CombatUI = ({
    player,
    cooldowns,
    enemy,
    combatLog,
    onAttack,
    handleSpellCast,
    isPlayerTurn,
    renderMagic,
    combatBackground,
}) => {
    const logContainerRef = useRef(null);
    const [spellbookOpen, setSpellbookOpen] = useState(false);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [combatLog]);

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
                <button
                    className={`${styles.attackButton} ${!isPlayerTurn && styles.disabled}`}
                    onClick={onAttack}
                    disabled={!isPlayerTurn}
                >
                    Attack
                </button>
                <button
                    className={`${styles.spellbookButton} ${!isPlayerTurn && styles.disabled}`}
                    onClick={() => setSpellbookOpen(true)}
                    disabled={!isPlayerTurn}
                >
                    Spellbook
                </button>
                <button
                    className={`${styles.itemsButton} ${!isPlayerTurn && styles.disabled}`}
                    disabled
                >
                    Items
                </button>
                <button
                    className={`${styles.runButton} ${!isPlayerTurn && styles.disabled}`}
                    disabled
                >
                    Run
                </button>
            </div>

            {/* Combat Logs */}
            <div className={styles.combatLogContainer} ref={logContainerRef}>
                <CombatLog log={combatLog} />
            </div>

            {/* Spellbook Modal */}
            {spellbookOpen && (
                <div className={styles.spellbookOverlay}>
                <Spellbook
                    spells={spells}
                    player={player}
                    cooldowns={cooldowns}
                    onCastSpell={(spell) => {
                        handleSpellCast(spell); // Ensure this calls the combat logic
                        setSpellbookOpen(false);
                    }}
                    closeSpellbook={() => setSpellbookOpen(false)}
                />
                </div>
            )}
        </div>
    );
};

export default CombatUI;
