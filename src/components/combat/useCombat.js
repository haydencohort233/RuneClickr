import { useState, useEffect } from 'react';

const useCombat = (player, enemy, onCombatEnd, setCombatLogEntries) => {
    const [playerHp, setPlayerHp] = useState(player?.hitpoints ?? 100);
    const [enemyHp, setEnemyHp] = useState(enemy?.properties?.health ?? 50);
    const [turn, setTurn] = useState('player');
    const [cooldowns, setCooldowns] = useState({});

    useEffect(() => {
        console.log('Combat started:', { player, enemy });
    }, []);

    useEffect(() => {
        const playerAgility = player?.agility ?? 0;
        const enemyAgility = enemy?.properties?.agility ?? 0;

        if (playerAgility > enemyAgility) {
            setTurn('player');
            setCombatLogEntries((prev) => [...prev, 'Player goes first.']);
        } else if (enemyAgility > playerAgility) {
            setTurn('enemy');
            setCombatLogEntries((prev) => [...prev, `${enemy.type} goes first.`]);
        } else {
            const randomTurn = Math.random() < 0.5 ? 'player' : 'enemy';
            setTurn(randomTurn);
            setCombatLogEntries((prev) => [...prev, `${randomTurn} goes first (tie-breaker).`]);
        }
    }, [player?.agility, enemy?.properties?.agility]);

    const updateEnemyHp = (damage) => {
        const updatedHp = Math.max(0, enemyHp - damage);
        setEnemyHp(updatedHp);
        setCombatLogEntries((prev) => [...prev, `${enemy.type} takes ${damage} damage.`]);

        if (updatedHp <= 0) {
            setCombatLogEntries((prev) => [...prev, `${enemy.type} defeated!`]);
            onCombatEnd('victory');
        }
    };

    const updatePlayerHp = (damage) => {
        const updatedHp = Math.max(0, playerHp - damage);
        setPlayerHp(updatedHp);

        if (updatedHp <= 0) {
            setCombatLogEntries((prev) => [...prev, 'Player defeated!']);
            onCombatEnd('defeat');
        }
    };

    const attackEnemy = () => {
        if (turn !== 'player' || cooldowns['action']) return;

        const playerAttackPower = player?.attackPower ?? 10;
        const enemyDefencePower = enemy?.properties?.defencePower ?? 0;
        const attackRoll = Math.floor(Math.random() * playerAttackPower) + 1;
        const damageDealt = Math.max(0, attackRoll - enemyDefencePower);

        setCombatLogEntries((prev) => [...prev, `Player attacks ${enemy.type} for ${damageDealt} damage.`]);
        updateEnemyHp(damageDealt);
        setTurn('enemy');
    };

    const enemyTurn = () => {
        if (enemyHp <= 0) return;

        const enemyAttackPower = enemy?.properties?.attackPower ?? 10;
        const playerDefencePower = player?.defencePower ?? 0;
        const attackRoll = Math.floor(Math.random() * enemyAttackPower) + 1;
        const damageDealt = Math.max(0, attackRoll - playerDefencePower);

        setCombatLogEntries((prev) => [
            ...prev,
            `${enemy.type} attacks for ${damageDealt} damage.`
        ]);

        if (damageDealt > 0) {
            updatePlayerHp(damageDealt);
        }

        setTurn('player');
    };

    useEffect(() => {
        if (turn === 'enemy') {
            setTimeout(enemyTurn, 1000); // Delay for effect
        }
    }, [turn]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCooldowns((prev) => {
                const updatedCooldowns = { ...prev };
                Object.keys(updatedCooldowns).forEach((key) => {
                    if (updatedCooldowns[key] > 0) {
                        updatedCooldowns[key] -= 1;
                    } else {
                        delete updatedCooldowns[key];
                    }
                });
                return updatedCooldowns;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return {
        playerHp,
        enemyHp,
        turn,
        attackEnemy,
        updateEnemyHp,
        cooldowns,
        setCooldowns,
        setTurn,
    };
};

export default useCombat;
