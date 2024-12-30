import React, { useState } from 'react';
import useCombat from './useCombat';
import CombatUI from './ui/combatUI';
import Magic from './magic/magic';
import './combat.module.css';

const Combat = ({ enemy, player = {}, setPlayer, onCombatEnd }) => {
    const { playerHp, enemyHp, turn, attackEnemy, updateEnemyHp, cooldowns, setCooldowns, setTurn } = useCombat(player, enemy, onCombatEnd);
    const [combatLogEntries, setCombatLogEntries] = useState([]);

    const handleAttack = () => {
        if (turn !== 'player' || cooldowns['action']) return;

        const playerAttackPower = player?.attackPower ?? 10;
        const enemyDefencePower = enemy?.properties?.defencePower ?? 0;
        const attackRoll = Math.floor(Math.random() * playerAttackPower) + 1;
        const damageDealt = Math.max(0, attackRoll - enemyDefencePower);

        if (damageDealt > 0) {
            updateEnemyHp(damageDealt);
            setCombatLogEntries((prevLog) => [
                ...prevLog,
                `You used Melee! Dealt ${damageDealt} damage.`,
            ]);
        } else {
            setCombatLogEntries((prevLog) => [
                ...prevLog,
                `Your attack missed!`,
            ]);
        }

        setTurn('enemy');
    };

    const handleSpellCast = (spell) => {
        if (turn !== 'player' || cooldowns['action']) return;

        if (spell.damage) {
            updateEnemyHp(spell.damage);
            setCombatLogEntries((prevLog) => [
                ...prevLog,
                `You cast ${spell.name}! Dealt ${spell.damage} damage.`,
            ]);
        } else {
            setCombatLogEntries((prevLog) => [
                ...prevLog,
                `${spell.name} missed!`,
            ]);
        }
    };

    return (
        <div className="combat-container">
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
                    />
                )}
            />
        </div>
    );
};

export default Combat;
