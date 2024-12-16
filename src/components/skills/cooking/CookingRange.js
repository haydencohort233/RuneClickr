import React, { useState, useEffect, useRef } from 'react';
import styles from './CookingRange.module.css';
import itemConfig from '../../items/itemConfig.json';

function CookingRange({ skills, gainExperience, gameState, setGameState, setLevelUpMessage }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCooking, setIsCooking] = useState(false);
  const [cookingQueue, setCookingQueue] = useState(0);
  const cookingIntervalRef = useRef(null);

  const cookingItems = itemConfig.items.filter(
    (item) =>
      item.cookable &&
      item.cookingOptions.some((option) => option.method === 'cooking_range') &&
      gameState.inventory.some((inventoryItem) => inventoryItem.itemId === item.itemId)
  );

  const handleCook = (quantity) => {
    if (!selectedItem) {
      alert('Please select an item to cook!');
      return;
    }

    const rawItemInInventory = gameState.inventory.find(
      (item) => item.itemId === selectedItem.itemId
    );
    if (!rawItemInInventory || rawItemInInventory.quantity < 1) {
      alert(`You do not have any ${selectedItem.name} in your inventory.`);
      setSelectedItem(null);
      return;
    }

    const maxCookable = rawItemInInventory.quantity;
    const amountToCook = quantity === 'all' ? maxCookable : Math.min(quantity, maxCookable);

    setCookingQueue(amountToCook);
    setIsCooking(true);
  };

  useEffect(() => {
    if (cookingQueue > 0 && !cookingIntervalRef.current) {
      cookingIntervalRef.current = setInterval(() => {
        cookItem();
      }, 2000);
    }

    return () => clearInterval(cookingIntervalRef.current);
  }, [cookingQueue]);

  const cookItem = () => {
    if (cookingQueue <= 0) {
      clearInterval(cookingIntervalRef.current);
      cookingIntervalRef.current = null;
      setIsCooking(false);
      return;
    }

    const cookingMethod = selectedItem?.cookingOptions?.find(
      (option) => option.method === 'cooking_range'
    );

    if (!cookingMethod) {
      console.error('Cooking method not found for selected item:', selectedItem);
      clearCooking();
      return;
    }

    if (skills.cooking.level >= cookingMethod.requiredCookingLevel) {
      gainExperience('cooking', cookingMethod.experience);

      const cookedItem = itemConfig.items.find((item) => item.name === cookingMethod.result);

      setTimeout(() => {
        setGameState((prevState) => {
          const updatedInventory = prevState.inventory
            .map((item) => {
              if (item.itemId === selectedItem.itemId) {
                return { ...item, quantity: item.quantity - 1 };
              }
              if (item.itemId === cookedItem.itemId) {
                return { ...item, quantity: (item.quantity || 0) + 1 };
              }
              return item;
            })
            .filter((item) => item.quantity > 0); // Remove items with zero quantity

          const rawItemExists = updatedInventory.some(
            (item) => item.itemId === selectedItem.itemId
          );

          if (!rawItemExists) {
            clearCooking();
          }

          return { ...prevState, inventory: updatedInventory };
        });
      }, 0); // Defer the update to avoid "update during render" warning

      setCookingQueue((prevQueue) => prevQueue - 1);
    } else {
      alert(`You need to reach level ${cookingMethod.requiredCookingLevel} in cooking.`);
      clearCooking();
    }
  };

  const clearCooking = () => {
    clearInterval(cookingIntervalRef.current);
    cookingIntervalRef.current = null;
    setCookingQueue(0);
    setIsCooking(false);
    setSelectedItem(null);
  };

  return (
    <div className={styles.cookingRange}>
      <h2>Cooking Range</h2>

      {cookingItems.length > 0 ? (
        <div className={styles.itemsContainer}>
          {cookingItems.map((item) => (
            <button
              key={item.itemId}
              onClick={() => setSelectedItem(item)}
              className={`${styles.cookingItem} ${selectedItem === item ? styles.selected : ''}`}
            >
              <img src={item.image} alt={item.name} className={styles.itemImage} />
              <p>
                {item.name} (
                {gameState.inventory.find((invItem) => invItem.itemId === item.itemId)?.quantity ||
                  0}
                )
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className={styles.noItemsMessage}>
          <p>You have nothing to cook!</p>
        </div>
      )}

      {selectedItem && !isCooking && (
        <div className={styles.cookOptions}>
          <h3>How many {selectedItem.name} would you like to cook?</h3>
          <button
            onClick={() => handleCook(1)}
            disabled={isCooking}
            className={styles.cookButton}
          >
            Cook 1
          </button>
          <button
            onClick={() => handleCook('all')}
            disabled={isCooking}
            className={styles.cookButton}
          >
            Cook All
          </button>
        </div>
      )}

      {isCooking && cookingQueue > 0 && (
        <div className={styles.cookingStatus}>
          Cooking... ({cookingQueue} remaining)
        </div>
      )}

      {isCooking && cookingQueue === 0 && (
        <div className={styles.noItemsMessage}>
          <p>You have nothing left to cook!</p>
        </div>
      )}
    </div>
  );
}

export default CookingRange;
