import React from 'react';
import HealthBar from './healthBar';
import CombatLog from './combatLog';
import './combatUI.module.css';

const CombatUI = ({ player, enemy, combatLog, onAttack, isPlayerTurn, renderMagic }) => {
    return (
        <div className="combat-ui">
            <div className="enemy-container">
                <h3>{enemy.type}</h3>
                <img
                    src={enemy.image}
                    alt={enemy.type}
                    className="enemy-photo"
                    width="150"
                    height="100"
                />
                <HealthBar current={enemy.health} max={enemy.maxHealth} />
            </div>

            <div className="player-container">
                <h3>{player.username}</h3>
                <HealthBar current={player.hitpoints} max={player.maxHitPoints} />
                <div className="action-menu">
                    {isPlayerTurn ? (
                        <>
                            <button onClick={onAttack}>Attack</button>
                            {renderMagic && renderMagic()}
                        </>
                    ) : (
                        <p>Enemy's Turn...</p>
                    )}
                </div>
            </div>
            <CombatLog log={combatLog} />
        </div>
    );
};

export default CombatUI;
