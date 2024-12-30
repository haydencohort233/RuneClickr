import React, { useState } from 'react';
import spells from './spells.json';
import Spellbook from './Spellbook';
import styles from './magic.module.css'; // Import the CSS module

const Magic = ({ player, setPlayer, onSpellCast, cooldowns = {}, setCooldowns, enemy, setTurn, setCombatLogEntries }) => {
    const [spellbookOpen, setSpellbookOpen] = useState(false);

    const hasRequiredRunes = (spell) => {
        return Object.keys(spell.requiredRunes).every((rune) => {
            const inventoryItem = player.inventory.find((item) => item.name === rune);
            return inventoryItem && inventoryItem.quantity >= spell.requiredRunes[rune];
        });
    };

    const castSpell = (spell) => {
        if (cooldowns['action']) {
            setCombatLogEntries((prevLog) => [...prevLog, 'You cannot use a spell this turn.']);
            return;
        }

        if (cooldowns[spell.id]) {
            setCombatLogEntries((prevLog) => [...prevLog, `${spell.name} is on cooldown for ${cooldowns[spell.id]} more turns.`]);
            return;
        }

        if (!hasRequiredRunes(spell)) {
            setCombatLogEntries((prevLog) => [...prevLog, `You don't have enough runes to cast ${spell.name}.`]);
            return;
        }

        const magicLevel = player.skills.magic.level ?? 1;
        const magicPower = player.magicPower ?? 0;

        const baseHitChance = 50;
        const scaledHitChance = (magicLevel * 1.5) + (magicPower * 1.2);
        const effectiveHitChance = Math.min(baseHitChance + scaledHitChance - (enemy?.properties?.magicDefense ?? 0), 95);
        const didHit = Math.random() * 100 < effectiveHitChance;

        if (!didHit) {
            setCombatLogEntries((prevLog) => [...prevLog, `${spell.name} missed!`]);
            setTurn('enemy');
            return;
        }

        const randomVariance = 1 - (spell.variance / 2) + Math.random() * spell.variance;
        const damage = Math.round((spell.damage + magicLevel * spell.levelMultiplier + magicPower * spell.powerMultiplier) * randomVariance);

        const updatedInventory = player.inventory.map((item) => {
            if (spell.requiredRunes[item.name]) {
                return {
                    ...item,
                    quantity: item.quantity - spell.requiredRunes[item.name],
                };
            }
            return item;
        }).filter((item) => item.quantity > 0);

        setPlayer((prevPlayer) => ({
            ...prevPlayer,
            inventory: updatedInventory,
        }));

        setCooldowns((prev) => ({
            ...prev,
            action: 1,
            [spell.id]: spell.cooldown,
        }));

        onSpellCast({ ...spell, damage });

        setCombatLogEntries((prevLog) => [...prevLog, `You cast ${spell.name}! Dealt ${damage} damage.`]);

        setTurn('enemy');
    };

    return (
        <div className={styles.magicContainer}>
            <button
                className={styles.magicSpellbookButton}
                onClick={() => setSpellbookOpen(true)}
                title="Open Spellbook"
            >
                <img
                    src="/assets/images/spells/spellbook.png"
                    alt="Open Spellbook"
                    className={styles.magicSpellbookIcon}
                />
            </button>
            {spellbookOpen && (
                <Spellbook
                    spells={spells}
                    player={player}
                    cooldowns={cooldowns}
                    onCastSpell={(spell) => {
                        setSpellbookOpen(false);
                        castSpell(spell);
                    }}
                    closeSpellbook={() => setSpellbookOpen(false)}
                />
            )}
        </div>
    );
};

export default Magic;
