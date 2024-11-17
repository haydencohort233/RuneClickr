// /components/inventory/inventory.js
import React, { useState } from 'react';
import styles from './inventory.module.css';
import itemConfig from '../items/itemConfig.json';

function Inventory({ inventory = [], setPlayer, maxInventorySpace }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [sortOption, setSortOption] = useState('rarity');

  const handleAddRandomItem = () => {
    if (inventory.length >= maxInventorySpace) {
      alert('Inventory is full! Cannot add more items.');
      return;
    }
    
    const randomItem = itemConfig.items[Math.floor(Math.random() * itemConfig.items.length)];
    if (!randomItem) return;

    setPlayer((prevPlayer) => {
      let updatedInventory = [...prevPlayer.inventory];
      const existingItemIndex = updatedInventory.findIndex(i => i.itemId === randomItem.itemId);

      if (randomItem.type === 'quest') {
        // Ensure quest items cannot be stacked and are unique
        if (existingItemIndex === -1) {
          updatedInventory.push({ ...randomItem, quantity: 1 });
        }
      } else {
        if (existingItemIndex >= 0 && updatedInventory[existingItemIndex].quantity < 65535) {
          updatedInventory[existingItemIndex].quantity += 1;
        } else if (existingItemIndex === -1) {
          updatedInventory.push({ ...randomItem, quantity: 1 });
        }
      }

      return { ...prevPlayer, inventory: updatedInventory };
    });
  };

  // Function to equip an item to a specific slot
  const handleEquipItem = (item) => {
    setPlayer((prevPlayer) => {
      let updatedInventory = [...prevPlayer.inventory];
      const itemIndex = updatedInventory.findIndex(i => i.itemId === item.itemId);
      if (itemIndex < 0) return prevPlayer;

      let updatedEquipment = { ...prevPlayer.equipment };
      // Ensure all equipment slots are defined
      if (!updatedEquipment.fingers) updatedEquipment.fingers = [null, null];
      if (!updatedEquipment.neck) updatedEquipment.neck = null; // Keep track of equipped items

      // Use the item slot directly from item data
      const slot = item.slot;

      if (slot === "fingers") {
        // Equip to the first available finger slot
        const ringSlotIndex = updatedEquipment.fingers.findIndex(slot => slot === null);
        if (ringSlotIndex !== -1) {
          updatedEquipment.fingers[ringSlotIndex] = item;
        } else {
          const replacedItem = updatedEquipment.fingers[0];
          updatedEquipment.fingers[0] = item; // Replace first ring if both are occupied
          if (replacedItem) {
            addItemToInventory(updatedInventory, replacedItem);
            console.log('Returned item to inventory:', replacedItem);
          }
        }
      } else if (slot === "neck") {
        // Equip to neck slot
        if (updatedEquipment.neck) {
          addItemToInventory(updatedInventory, updatedEquipment.neck); // Return the previously equipped item to inventory
          console.log('Returned item to inventory:', updatedEquipment.neck);
        }
        updatedEquipment.neck = item; // Equip the item
      } else {
        if (updatedEquipment[slot]) {
          addItemToInventory(updatedInventory, updatedEquipment[slot]); // Return the previously equipped item to inventory
          console.log('Returned item to inventory:', updatedEquipment[slot]);
        }
        updatedEquipment[slot] = item; // Equip the item
      }

      // Remove the item from inventory
      if (updatedInventory[itemIndex].quantity > 1) {
        updatedInventory[itemIndex].quantity -= 1;
      } else {
        updatedInventory.splice(itemIndex, 1);
      }

      console.log('Current equipment:', updatedEquipment);
      return { ...prevPlayer, inventory: updatedInventory, equipment: updatedEquipment };
    });
  };

  // Helper function to add item to inventory, considering stacking and space limitations
  const addItemToInventory = (inventory, item) => {
    const existingItemIndex = inventory.findIndex(i => i.itemId === item.itemId);

    if (existingItemIndex >= 0 && inventory[existingItemIndex].quantity < 65535) {
      inventory[existingItemIndex].quantity += 1;
    } else if (existingItemIndex >= 0) {
        // Stack the item if it already exists but the quantity is at max
        inventory[existingItemIndex].quantity = Math.min(inventory[existingItemIndex].quantity + 1, 65535);
    } else if (inventory.length < maxInventorySpace) {
      inventory.push({ ...item, quantity: 1 });
    } else {
      alert('Inventory is full! Cannot unequip the item.');
      throw new Error('Inventory is full.'); // Prevent further unequip if inventory is full
    }
  };

  // Function to handle item actions from inventory
  const handleItemAction = (itemId, action) => {
    const item = itemConfig.items.find((i) => i.itemId === itemId);
    if (!item) return;

    setPlayer((prevPlayer) => {
      let updatedInventory = [...prevPlayer.inventory];
      const itemIndex = updatedInventory.findIndex(i => i.itemId === itemId);
      if (itemIndex >= 0) {
        if (item.type === 'quest') {
          alert('This is a quest item and cannot be dropped or used.');
          return prevPlayer;
        }

        if (action === "drop") {
          updatedInventory.splice(itemIndex, 1);
        } else if (action === "use" && updatedInventory[itemIndex].quantity > 1) {
          updatedInventory[itemIndex].quantity -= 1;
        } else if (action === "use") {
          updatedInventory.splice(itemIndex, 1);
        }
      }

      // Apply item effect if the action is to use
      let updatedPlayer = { ...prevPlayer, inventory: updatedInventory };
      if (action === "use") {
        if (item.type === "food" && item.effect.heal) {
          updatedPlayer.hitpoints = Math.min(updatedPlayer.maxHitPoints, updatedPlayer.hitpoints + item.effect.heal);
        } else if (item.type === "potion" && item.effect.heal) {
          updatedPlayer.hitpoints = Math.min(updatedPlayer.maxHitPoints, updatedPlayer.hitpoints + item.effect.heal);
        } else if (item.type === "weapon" && item.attackBoost) {
          updatedPlayer.attackPower += item.attackBoost;
        } else if (item.type === "armor" && item.defenceBoost) {
          updatedPlayer.defencePower += item.defenceBoost;
        }
      }

      return updatedPlayer;
    });
  };

  // Sort inventory based on the selected sort option
  const sortedInventory = [...inventory].sort((a, b) => {
    const itemA = itemConfig.items.find(i => i.itemId === a.itemId);
    const itemB = itemConfig.items.find(i => i.itemId === b.itemId);
    if (!itemA || !itemB) return 0;

    if (sortOption === 'rarity') {
      const rarityOrder = ["common", "uncommon", "rare", "very rare", "mythical", "quest"];
      return rarityOrder.indexOf(itemA.rarity) - rarityOrder.indexOf(itemB.rarity);
    }

    return 0;
  });

  return (
    <div className={styles.inventoryContainer}>
      <button onClick={handleAddRandomItem} className={styles.devButton}>Add Random Item (Dev)</button>
      <div className={styles.sortOptions}>
        <label htmlFor="sort">Sort by:</label>
        <select id="sort" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="default">Default</option>
          <option value="rarity">Rarity</option>
        </select>
      </div>
      {inventory.length === 0 ? (
        <p>Your inventory is empty.</p>
      ) : (
        <div className={styles.inventoryGrid}>
          {sortedInventory.map((item, index) => {
            const itemData = itemConfig.items.find(i => i.itemId === item.itemId);
            if (!itemData) return null;
            const rarityClass = {
              "common": styles.common,
              "uncommon": styles.uncommon,
              "rare": styles.rare,
              "very rare": styles.veryRare,
              "mythical": styles.mythical,
              "quest": styles.quest
            };
            return (
              <div 
                key={index} 
                className={`${styles.inventoryItem} ${rarityClass[itemData.rarity]}`}
                onMouseEnter={() => setHoveredItem(itemData)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <img src={`http://localhost:5000/assets/images/items/${itemData.image}`} alt={itemData.name} className={styles.itemImage} />
                <p>{itemData.name} (x{item.quantity})</p>
                
                {itemData.type === "weapon" && (
                  <>
                    <button onClick={() => handleEquipItem(item)}>Equip</button>
                    <button onClick={() => handleItemAction(item.itemId, 'drop')}>Drop</button>
                  </>
                )}

                {itemData.type === "armor" && (
                  <>
                    <button onClick={() => handleEquipItem(item)}>Equip</button>
                    <button onClick={() => handleItemAction(item.itemId, 'drop')}>Drop</button>
                  </>
                )}

                {itemData.type === "jewelry" && (
                  <>
                    <button onClick={() => handleEquipItem(item)}>Equip</button>
                    <button onClick={() => handleItemAction(item.itemId, 'drop')}>Drop</button>
                  </>
                )}

                {itemData.type === "food" && (
                  <>
                    <button onClick={() => handleItemAction(item.itemId, 'use')}>Eat</button>
                    <button onClick={() => handleItemAction(item.itemId, 'drop')}>Drop</button>
                  </>
                )}
                
                {itemData.type === "potion" && (
                  <>
                    <button onClick={() => handleItemAction(item.itemId, 'use')}>Drink</button>
                    <button onClick={() => handleItemAction(item.itemId, 'drop')}>Drop</button>
                  </>
                )}
                
                {itemData.type === "quest" ? (
                  <button>Quest Item</button>
                ) : (itemData.type !== "weapon" && itemData.type !== "armor" && itemData.type !== "food" && itemData.type !== "potion" && itemData.type !== "jewelry") && (
                  <button onClick={() => handleItemAction(item.itemId, 'drop')}>Drop</button>
                )}

                {hoveredItem && hoveredItem.itemId === item.itemId && (
                  <div className={styles.tooltip}>
                    <p><strong>{hoveredItem.name}</strong></p>
                    <p>{hoveredItem.description}</p>
                    {hoveredItem.attackBoost !== undefined && hoveredItem.attackBoost !== 0 && <p>Attack Boost: {hoveredItem.attackBoost}</p>}
                    {hoveredItem.defenceBoost !== undefined && hoveredItem.defenceBoost !== 0 && <p>Defence Boost: {hoveredItem.defenceBoost}</p>}
                    {hoveredItem.effect && hoveredItem.effect.heal && <p>Heal: {hoveredItem.effect.heal}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Inventory;
