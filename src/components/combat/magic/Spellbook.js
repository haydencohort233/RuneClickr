import React from 'react';
import styles from './spellbook.module.css';

const fallbackIcon = '/assets/images/spells/fallback.png'; // Define the fallback image path

const Spellbook = ({ spells, player, cooldowns, onCastSpell, closeSpellbook }) => {
    const canCast = (spell) => {
        const hasRequiredRunes = Object.keys(spell.requiredRunes).every((rune) => {
            const inventoryItem = player.inventory.find((item) => item.name === rune);
            return inventoryItem && inventoryItem.quantity >= spell.requiredRunes[rune];
        });

        return (
            !cooldowns[spell.id] &&
            player.skills.magic.level >= spell.levelRequired &&
            hasRequiredRunes
        );
    };

    return (
        <div className={styles.spellbookContainer}>
            <div className={styles.spellbookHeader}>
                <h3>Spellbook</h3>
                <button onClick={closeSpellbook} className={styles.closeButton}>
                    Close
                </button>
            </div>
            <div className={styles.spellbookList}>
                {spells.map((spell) => (
                    <button
                        key={spell.id}
                        onClick={() => canCast(spell) && onCastSpell(spell)}
                        disabled={!canCast(spell)}
                        className={`${styles.spellButton} ${!canCast(spell) ? styles.disabled : ''}`}
                        title={
                            canCast(spell)
                                ? `Level ${spell.levelRequired}, Damage: ${spell.damage}`
                                : `Cannot cast: Requirements not met`
                        }
                    >
                        <img
                            src={spell.icon || fallbackIcon}
                            alt={spell.name}
                            className={styles.spellIcon}
                            onError={(e) => (e.target.src = fallbackIcon)} // Set fallback on error
                        />
                        <span>{spell.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Spellbook;
