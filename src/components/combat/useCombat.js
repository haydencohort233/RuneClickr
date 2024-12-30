import { useState, useEffect } from 'react';

const useCombat = (player, enemy, onCombatEnd) => {
    const [playerHp, setPlayerHp] = useState(player?.hitpoints ?? 100);
    const [enemyHp, setEnemyHp] = useState(enemy?.properties?.health ?? 50);
    const [turn, setTurn] = useState('player');
    const [cooldowns, setCooldowns] = useState({});

    // Log initial player and enemy stats
    useEffect(() => {
        console.log('Combat started:');
        console.log('Player stats:', player);
        console.log('Enemy stats:', enemy);
    }, []);

    // Initialize turn order
    useEffect(() => {
        const playerAgility = player?.agility ?? 0;
        const enemyAgility = enemy?.properties?.agility ?? 0;

        if (playerAgility > enemyAgility) {
            console.log(`Player goes first (Agility: ${playerAgility} vs Enemy Agility: ${enemyAgility}).`);
            setTurn('player');
        } else if (enemyAgility > playerAgility) {
            console.log(`Enemy goes first (Agility: ${enemyAgility} vs Player Agility: ${playerAgility}).`);
            setTurn('enemy');
        } else {
            const randomRoll = Math.random();
            const firstTurn = randomRoll < 0.5 ? 'player' : 'enemy';
            console.log(`Equal Agility (Player: ${playerAgility}, Enemy: ${enemyAgility}). Random roll: ${randomRoll}. ${firstTurn} goes first.`);
            setTurn(firstTurn);
        }
    }, [player?.agility, enemy?.properties?.agility]);

    const updateEnemyHp = (damage) => {
        console.log(`Player deals ${damage} damage.`);
        const updatedHp = Math.max(0, enemyHp - damage);
        console.log(`Enemy HP updated: ${enemyHp} -> ${updatedHp}`);
        setEnemyHp(updatedHp);

        if (updatedHp <= 0) {
            console.log('Enemy defeated! Player wins.');
            onCombatEnd('victory');
        }
    };

    const attackEnemy = () => {
        if (!enemy || turn !== 'player' || cooldowns['action']) {
            console.log('Player attack skipped. Invalid state or cooldown active.');
            return;
        }

        const playerAttackPower = player?.attackPower ?? 10;
        const enemyDefencePower = enemy?.properties?.defencePower ?? 0;

        const attackRoll = Math.floor(Math.random() * playerAttackPower) + 1;
        const damageDealt = Math.max(0, attackRoll - enemyDefencePower);

        console.log(`Player attacks with roll: ${attackRoll}. Damage dealt after defense: ${damageDealt}.`);
        updateEnemyHp(damageDealt);

        console.log('Ending player turn. Enemy turn starts.');
        setTurn('enemy');
    };

    const enemyTurn = () => {
        if (enemyHp <= 0) {
            console.log('Enemy skipped turn because it is defeated.');
            return;
        }

        const enemyMagicLevel = enemy?.properties?.magicLevel ?? 0;
        const enemyMagicPower = enemy?.properties?.magicPower ?? 0;

        const useMagic = Math.random() < 0.5 && enemyMagicLevel > 0;

        if (useMagic) {
            const spell = enemy?.properties?.spells?.[0];
            if (spell && spell.damage) {
                const magicDamage = spell.damage + enemyMagicPower + enemyMagicLevel * 1.5;
                console.log(`Enemy casts ${spell.name}, dealing ${magicDamage} magic damage.`);
                setPlayerHp((prev) => {
                    const updatedHp = Math.max(0, prev - magicDamage);
                    console.log(`Player HP updated: ${prev} -> ${updatedHp}`);
                    return updatedHp;
                });
            }
        } else {
            const enemyAttackPower = enemy?.properties?.attackPower ?? 10;
            const playerDefencePower = player?.defencePower ?? 0;

            const attackRoll = Math.floor(Math.random() * enemyAttackPower) + 1;
            const damageDealt = Math.max(0, attackRoll - playerDefencePower);

            console.log(`Enemy attacks with roll: ${attackRoll}. Damage dealt after defense: ${damageDealt}.`);
            setPlayerHp((prev) => {
                const updatedHp = Math.max(0, prev - damageDealt);
                console.log(`Player HP updated: ${prev} -> ${updatedHp}`);
                return updatedHp;
            });
        }

        console.log('Ending enemy turn. Player turn starts.');
        setTurn('player');
    };

    // Handle enemy actions on their turn
    useEffect(() => {
        if (turn === 'enemy') {
            console.log('Enemy turn begins.');
            setTimeout(() => {
                enemyTurn();
            }, 1000); // Delay for enemy actions
        }
    }, [turn]);

    // Cooldown management
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
