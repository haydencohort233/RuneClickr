// /components/inventory/inventory.js
import React, { useState, useEffect } from 'react';
import styles from './inventory.module.css';
import itemConfig from '../items/itemConfig.json';

function Inventory({ inventory = [], setPlayer, maxInventorySpace }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [sortOption, setSortOption] = useState('rarity');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dropItem, setDropItem] = useState(null);

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

  // Tooltip Position Logic
  const getTooltipPosition = (element) => {
    if (!element) return { top: '100%', left: '50%', transform: 'translateX(-50%)' };

    const rect = element.getBoundingClientRect();
    const containerRect = element.closest(`.${styles.inventoryContainer}`).getBoundingClientRect();
    const tooltipHeight = 60; // Estimated tooltip height
    const tooltipWidth = 150; // Estimated tooltip width
    const spaceBelow = containerRect.bottom - rect.bottom;
    const spaceRight = containerRect.right - rect.right;
    const spaceLeft = rect.left - containerRect.left;

    let position = {};

    // Determine vertical position
    if (spaceBelow >= tooltipHeight) {
      position = { top: '100%', left: '50%', transform: 'translateX(-50%)' };
    } else {
      position = { bottom: '110%', left: '50%', transform: 'translateX(-50%)' };
    }

    // Adjust horizontal position if tooltip is going off the container on the left side
    if (spaceLeft < tooltipWidth / 2) {
      position.left = '0';
      position.transform = 'translateX(10%)';
    }

    // Ensure tooltip does not get cut off on the right side
    if (spaceRight < tooltipWidth / 2) {
      position.left = 'auto';
      position.right = '0';
      position.transform = 'translateX(-10%)';
    }

    return position;
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

    if (action === 'drop') {
      setDropItem(item);
      setSelectedItem(item);
      return;
    }

    setPlayer((prevPlayer) => {
      let updatedInventory = [...prevPlayer.inventory];
      const itemIndex = updatedInventory.findIndex(i => i.itemId === itemId);
      if (itemIndex >= 0) {
        if (item.type === 'quest') {
          alert('This is a quest item and cannot be dropped or used.');
          return prevPlayer;
        }

        if (action === "use" && updatedInventory[itemIndex].quantity > 1) {
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

  // Function to drop a specific quantity of an item
  const handleDropQuantity = (quantity) => {
    if (!dropItem) return;

    setPlayer((prevPlayer) => {
      let updatedInventory = [...prevPlayer.inventory];
      const itemIndex = updatedInventory.findIndex(i => i.itemId === dropItem.itemId);
      if (itemIndex >= 0) {
        if (quantity >= updatedInventory[itemIndex].quantity) {
          updatedInventory.splice(itemIndex, 1);
        } else {
          updatedInventory[itemIndex].quantity -= quantity;
        }
      }

      return { ...prevPlayer, inventory: updatedInventory };
    });
    setDropItem(null);
    setSelectedItem(null);
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
                onMouseEnter={(e) => setHoveredItem({ itemData, position: getTooltipPosition(e.currentTarget) })}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => setSelectedItem(selectedItem === item ? null : item)}
              >
                {dropItem && dropItem.itemId === item.itemId ? (
                  <div className={styles.dropOptions}>
                    <p>Drop {dropItem.name} (x{inventory.find(i => i.itemId === dropItem.itemId)?.quantity || 1})</p>
                    <button className={styles.dropOneButton} onClick={() => handleDropQuantity(1)}>Drop 1</button>
                    <button className={styles.dropXButton} onClick={() => handleDropQuantity(prompt('Enter quantity to drop:', '1'))}>Drop X</button>
                    <button className={styles.dropAllButton} onClick={() => handleDropQuantity(inventory.find(i => i.itemId === dropItem.itemId)?.quantity || 1)}>Drop All</button>
                    <button className={styles.cancelButton} onClick={() => { setDropItem(null); setSelectedItem(null); }}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <img src={`http://localhost:5000/assets/images/items/${itemData.image}`} alt={itemData.name} className={styles.itemImage} />
                    <p>{itemData.name} (x{item.quantity})</p>
                    {selectedItem && selectedItem.itemId === item.itemId && !dropItem && (
                      <div>
                        {itemData.type === "weapon" && (
                          <>
                            <button className={styles.equipButton} onClick={() => handleEquipItem(item)}>Equip</button>
                            <button className={styles.dropButton} onClick={() => handleItemAction(item.itemId, 'drop')}>Drop</button>
                          </>
                        )}

                        {itemData.type === "armor" && (
                          <>
                            <button className={styles.equipButton} onClick={() => handleEquipItem(item)}>Equip</button>
                            <button className={styles.dropButton} onClick={() => handleItemAction(item.itemId, 'drop')}>Drop</button>
                          </>
                        )}

                        {itemData.type === "jewelry" && (
                          <>
                            <button className={styles.equipButton} onClick={() => handleEquipItem(item)}>Equip</button>
                            <button className={styles.dropButton} onClick={() => handleItemAction(item.itemId, 'drop')}>Drop</button>
                          </>
                        )}

                        {itemData.type === "food" && (
                          <>
                            <button className={styles.eatButton} onClick={() => handleItemAction(item.itemId, 'use')}>Eat</button>
                            <button className={styles.dropButton} onClick={() => handleItemAction(item.itemId, 'drop')}>Drop</button>
                          </>
                        )}
                        
                        {itemData.type === "potion" && (
                          <>
                            <button className={styles.drinkButton} onClick={() => handleItemAction(item.itemId, 'use')}>Drink</button>
                            <button className={styles.dropButton} onClick={() => handleItemAction(item.itemId, 'drop')}>Drop</button>
                          </>
                        )}
                        
                        {itemData.type === "quest" ? (
                          <button className={styles.questButton}>Quest Item</button>
                        ) : (itemData.type !== "weapon" && itemData.type !== "armor" && itemData.type !== "food" && itemData.type !== "potion" && itemData.type !== "jewelry") && (
                          <button className={styles.dropButton} onClick={() => handleItemAction(item.itemId, 'drop')}>Drop</button>
                        )}
                      </div>
                    )}
                  </>
                )}
                {hoveredItem && hoveredItem.itemData.itemId === item.itemId && (
                      <div className={styles.tooltip} style={hoveredItem.position}>
                        <p><strong>{hoveredItem.itemData.name}</strong></p>
                        <p>{hoveredItem.itemData.description}</p>
                        {hoveredItem.itemData.attackBoost !== undefined && hoveredItem.itemData.attackBoost !== 0 && <p>Attack Boost: {hoveredItem.itemData.attackBoost}</p>}
                        {hoveredItem.itemData.defenceBoost !== undefined && hoveredItem.itemData.defenceBoost !== 0 && <p>Defence Boost: {hoveredItem.itemData.defenceBoost}</p>}
                        {hoveredItem.itemData.effect && hoveredItem.itemData.effect.heal && <p>Heal: {hoveredItem.itemData.effect.heal}</p>}
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
