import React, { useEffect } from 'react';
import styles from './equipment.module.css';
import equipmentSlots from './equipmentSlots.json';
import equipmentSlotsImage from '../../assets/images/items/armor/equipmentSlots.png';

function Equipment({ gameState, setGameState }) {
  // Function to calculate total stats based on equipped items
  const calculateTotalStats = (equipment) => {
    let totalAttackPower = 0;
    let totalDefencePower = 0;

    Object.values(equipment).forEach((item) => {
      if (Array.isArray(item)) {
        item.forEach((subItem) => {
          if (subItem) {
            totalAttackPower += subItem.attackBoost || 0;
            totalDefencePower += subItem.defenceBoost || 0;
          }
        });
      } else if (item) {
        totalAttackPower += item.attackBoost || 0;
        totalDefencePower += item.defenceBoost || 0;
      }
    });

    return { totalAttackPower, totalDefencePower };
  };

  // Initialize base stats and update stats when equipment changes
  useEffect(() => {
    if (!gameState.baseAttackPower || !gameState.baseDefencePower) {
      setGameState((prevState) => ({
        ...prevState,
        baseAttackPower: prevState.attackPower || 0,
        baseDefencePower: prevState.defencePower || 0,
      }));
    }

    const { totalAttackPower, totalDefencePower } = calculateTotalStats(gameState.equipment);
    setGameState((prevState) => ({
      ...prevState,
      equipmentAttackPower: totalAttackPower,
      equipmentDefencePower: totalDefencePower,
      attackPower: (prevState.baseAttackPower || 0) + totalAttackPower,
      defencePower: (prevState.baseDefencePower || 0) + totalDefencePower,
    }));
  }, [gameState.equipment, gameState.baseAttackPower, gameState.baseDefencePower, setGameState]);

  // Helper function to add item to inventory, considering stacking and space limitations
  const addItemToInventory = (inventory, item, maxInventorySpace) => {
    const existingItemIndex = inventory.findIndex(i => i.itemId === item.itemId);

    if (existingItemIndex >= 0 && inventory[existingItemIndex].quantity < 25) {
      inventory[existingItemIndex].quantity += 1;
    } else if (inventory.length < maxInventorySpace) {
      inventory.push({ ...item, quantity: 1 });
    } else {
      alert('Inventory is full! Cannot unequip the item.');
      throw new Error('Inventory is full.'); // Prevent further unequip if inventory is full
    }
  };

  // Function to unequip an item from a specific slot
  const handleUnequipItem = (slot, fingerIndex = null) => {
    setGameState((prevState) => {
      let updatedEquipment = { ...prevState.equipment };
      let updatedInventory = [...prevState.inventory];

      if (slot === 'fingers' && fingerIndex !== null) {
        if (updatedEquipment.fingers[fingerIndex]) {
          addItemToInventory(updatedInventory, updatedEquipment.fingers[fingerIndex], prevState.maxInventorySpace);
          updatedEquipment.fingers[fingerIndex] = null;
        }
      } else {
        if (updatedEquipment[slot]) {
          addItemToInventory(updatedInventory, updatedEquipment[slot], prevState.maxInventorySpace);
          updatedEquipment[slot] = null;
        }
      }

      const { totalAttackPower, totalDefencePower } = calculateTotalStats(updatedEquipment);

      return {
        ...prevState,
        equipment: updatedEquipment,
        inventory: updatedInventory,
        equipmentAttackPower: totalAttackPower,
        equipmentDefencePower: totalDefencePower,
        attackPower: (prevState.baseAttackPower || 0) + totalAttackPower,
        defencePower: (prevState.baseDefencePower || 0) + totalDefencePower,
      };
    });
  };

  return (
    <div className={styles.equipmentContainer}>
      <div className={styles.equipmentUI}>
        {/* Display the equipment slots background image */}
        <img
          src={equipmentSlotsImage}
          alt="Equipment Slots"
          className={styles.equipmentSlotsImage}
        />
        {Object.entries(equipmentSlots.equipmentSlots).map(([slot, slotInfo], index) => {
          if (slot === 'fingers') {
            return slotInfo.map((fingerSlot, fingerIndex) => (
              <div
                key={`finger-${fingerIndex}`}
                className={styles.equipmentSlot}
                style={{
                  top: `${fingerSlot.y}px`,
                  left: `${fingerSlot.x}px`,
                  width: `${fingerSlot.width}px`,
                  height: `${fingerSlot.height}px`,
                }}
                onClick={() => handleUnequipItem(slot, fingerIndex)}
              >
                {gameState.equipment.fingers[fingerIndex] ? (
                  <img
                    src={`http://localhost:5000/assets/images/items/${gameState.equipment.fingers[fingerIndex].image}`}
                    alt={gameState.equipment.fingers[fingerIndex].name}
                    className={styles.equipmentImage}
                  />
                ) : (
                  <div className={styles.emptySlot} />
                )}
              </div>
            ));
          } else {
            return (
              <div
                key={index}
                className={styles.equipmentSlot}
                style={{
                  top: `${slotInfo.y}px`,
                  left: `${slotInfo.x}px`,
                  width: `${slotInfo.width}px`,
                  height: `${slotInfo.height}px`,
                }}
                onClick={() => handleUnequipItem(slot)}
              >
                {gameState.equipment[slot] ? (
                  <img
                    src={`http://localhost:5000/assets/images/items/${gameState.equipment[slot].image}`}
                    alt={gameState.equipment[slot].name}
                    className={styles.equipmentImage}
                  />
                ) : (
                  <div className={styles.emptySlot} />
                )}
              </div>
            );
          }
        })}
        <div className={styles.totalStats}>
          <h3>Total Stats:</h3>
          <p>Attack Power: {gameState.attackPower || 0}</p>
          <p>Defence Power: {gameState.defencePower || 0}</p>
          {gameState.equipmentAttackPower !== 0 && <p>Equipment Attack Bonus: {gameState.equipmentAttackPower}</p>}
          {gameState.equipmentDefencePower !== 0 && <p>Equipment Defence Bonus: {gameState.equipmentDefencePower}</p>}
        </div>
      </div>
    </div>
  );
}

export default Equipment;
