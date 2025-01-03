import React, { useState } from 'react';
import useCombat from './useCombat';
import CombatUI from './ui/combatUI';
import Magic from './magic/magic';
import worldLocations from '../worldmap/worldLocations.json';
import styles from './combat.module.css';
import spells from './magic/spells.json';

const Combat = ({ enemy, player = {}, setPlayer, onCombatEnd, currentLocation, isPlayerTurn }) => {
    const [combatLogEntries, setCombatLogEntries] = useState([]); // Define this first
    const { playerHp, enemyHp, turn, attackEnemy, updateEnemyHp, cooldowns, setCooldowns, setTurn } =
        useCombat(player, enemy, onCombatEnd, setCombatLogEntries); // Pass after definition

    const locationData = worldLocations.find((location) => location.id === currentLocation) || {};
    const combatBackground =
        locationData.combat_bg && locationData.combat_bg.trim() !== ''
            ? locationData.combat_bg
            : '/assets/images/locations/cowpens/combat-bg.png';

    const handleAttack = () => {
        if (turn !== 'player' || cooldowns['action']) return;

        const playerAttackPower = player?.attackPower ?? 10;
        const enemyDefencePower = enemy?.properties?.defencePower ?? 0;
        const attackRoll = Math.floor(Math.random() * playerAttackPower) + 1;
        const damageDealt = Math.max(0, attackRoll - enemyDefencePower);

        if (damageDealt > 0) {
            updateEnemyHp(damageDealt);
            setCombatLogEntries((prevLog) => [...prevLog, `You used Melee! Dealt ${damageDealt} damage.`]);
        } else {
            setCombatLogEntries((prevLog) => [...prevLog, `Your attack missed!`]);
        }

        setTurn('enemy');
    };

    const handleSpellCast = (spell) => {
        if (turn !== 'player' || cooldowns['action']) return;

        console.log(`Casting spell: ${spell.name}`);

        updateEnemyHp(spell.damage); // Apply damage
        setCombatLogEntries((prevLog) => [
            ...prevLog,
            `You cast ${spell.name}! Dealt ${spell.damage} damage.`,
        ]);

        setTimeout(() => setTurn('enemy'), 500); // Slight delay before switching turns
    };

    return (
        <div className={styles.modalOverlay}>
            <div
                className={styles.combatModal}
                style={{
                    backgroundImage: `url(${combatBackground})`,
                }}
            >
                <CombatUI
                    player={{
                        ...player,
                        hitpoints: playerHp,
                    }}
                    enemy={{
                        ...enemy,
                        health: enemyHp,
                        maxHealth: enemy.properties.health,
                    }}
                    combatLog={combatLogEntries}
                    onAttack={handleAttack}
                    isPlayerTurn={turn === 'player'}
                    handleSpellCast={handleSpellCast}
                    renderMagic={() => (
                        <Magic
                            player={player}
                            setPlayer={setPlayer}
                            onSpellCast={handleSpellCast}
                            cooldowns={cooldowns}
                            setCooldowns={setCooldowns}
                            enemy={enemy}
                            setTurn={setTurn}
                            setCombatLogEntries={setCombatLogEntries}
                            isPlayerTurn={turn === 'player'}
                        />
                    )}
                />
            </div>
        </div>
    );
};

export default Combat;
