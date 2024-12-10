// /src/components/skills/cooking/CookingRange.js
import React, { useState } from 'react';
import styles from './CookingRange.module.css';
import itemConfig from '../../items/itemConfig.json'; // Import your itemConfig.json

function CookingRange({ skills, gainExperience, gameState, setGameState }) {
  const [selectedItem, setSelectedItem] = useState(null);

  // Filter items that can be cooked using cooking range AND are in player's inventory
  const cookingItems = itemConfig.items.filter(
    (item) => 
      item.cookable &&
      item.cookingOptions.some(option => option.method === 'cooking_range') &&
      gameState.inventory.some(inventoryItem => inventoryItem.itemId === item.itemId)
  );

  const handleCook = () => {
    if (!selectedItem) {
      alert('Please select an item to cook!');
      return;
    }

    const cookingMethod = selectedItem.cookingOptions.find(option => option.method === 'cooking_range');

    if (skills.cooking.level >= cookingMethod.requiredCookingLevel) {
      // Gain cooking experience
      gainExperience('cooking', cookingMethod.experience);

      // Replace raw item with cooked item
      const cookedItem = itemConfig.items.find(item => item.name === cookingMethod.result);
      
      setGameState((prevState) => {
        // Remove one instance of the raw item from inventory
        const updatedInventory = [...prevState.inventory];
        const itemIndex = updatedInventory.findIndex(item => item.itemId === selectedItem.itemId);

        if (itemIndex !== -1) {
          if (updatedInventory[itemIndex].quantity > 1) {
            updatedInventory[itemIndex].quantity -= 1; // Decrement quantity if more than one
          } else {
            updatedInventory.splice(itemIndex, 1); // Remove item if only one left
          }
        }

        // Add the cooked item to inventory
        const cookedItemIndex = updatedInventory.findIndex(item => item.itemId === cookedItem.itemId);
        if (cookedItemIndex !== -1) {
          updatedInventory[cookedItemIndex].quantity += 1; // Increment quantity if already in inventory
        } else {
          updatedInventory.push({ ...cookedItem, quantity: 1 }); // Add new cooked item with quantity 1
        }

        return {
          ...prevState,
          inventory: updatedInventory,
        };
      });

      alert(`You successfully cooked ${cookedItem.name} and gained ${cookingMethod.experience} cooking experience!`);
      setSelectedItem(null); // Clear selection
    } else {
      alert(`You need to reach level ${cookingMethod.requiredCookingLevel} in cooking to cook this item.`);
    }
  };

  return (
    <div className={styles.cookingRange}>
      <h2>Cooking Range</h2>
      <div className={styles.itemsContainer}>
        {cookingItems.map((item, index) => (
          <button
            key={index}
            onClick={() => setSelectedItem(item)}
            className={`${styles.cookingItem} ${selectedItem === item ? styles.selected : ''}`}
          >
            {item.name}
          </button>
        ))}
      </div>
      <button onClick={handleCook} className={styles.cookButton}>
        Cook Selected Item
      </button>
    </div>
  );
}

export default CookingRange;
