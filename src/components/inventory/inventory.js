import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import styles from './inventory.module.css';
import itemConfig from '../items/itemConfig.json';

const ItemTypes = {
  ITEM: 'item',
};

const MAX_INVENTORY_CAPACITY = 30;
const MAX_STACK_SIZE = 65535;

function Inventory({ inventory = [], setPlayer, maxInventorySpace = MAX_INVENTORY_CAPACITY, gameState, setGameState }) {
  const [itemOptions, setItemOptions] = useState(null);
  const [dropOptions, setDropOptions] = useState(null);
  const optionsTimeout = useRef(null);

  const handleMoveItem = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    const updatedInventory = [...inventory];
    const [movedItem] = updatedInventory.splice(fromIndex, 1);
    updatedInventory.splice(toIndex, 0, movedItem);

    const filteredInventory = updatedInventory.filter((item) => item !== null);

    setPlayer((prevPlayer) => ({
      ...prevPlayer,
      inventory: filteredInventory,
    }));
  }, [inventory, setPlayer]);

  const handleLeftClick = useCallback((item, index, slotElement) => {
    if (item) {
      const rect = slotElement.getBoundingClientRect();
      const bottomSpace = window.innerHeight - rect.bottom;
      const topSpace = rect.top;
  
      const position = bottomSpace < 150 
        ? { top: rect.top + window.scrollY - 150, left: rect.left + rect.width / 2 } // Above the slot
        : { top: rect.bottom + window.scrollY, left: rect.left + rect.width / 2 };  // Below the slot
  
      setItemOptions({
        item,
        index,
        position,
      });
  
      if (optionsTimeout.current) {
        clearTimeout(optionsTimeout.current);
      }
  
      optionsTimeout.current = setTimeout(() => {
        setItemOptions(null);
      }, 5000);
    } else {
      setItemOptions(null);
    }
  }, []);  

  const handleMouseEnterOptions = useCallback(() => {
    if (optionsTimeout.current) {
      clearTimeout(optionsTimeout.current);
    }
  }, []);
  
  const handleMouseLeaveOptions = useCallback(() => {
    if (optionsTimeout.current) {
      clearTimeout(optionsTimeout.current);
    }
    optionsTimeout.current = setTimeout(() => {
      setItemOptions(null);
    }, 5000);
  }, []);  

  const handleEquipItem = (item) => {
    setGameState((prevState) => {
      let updatedEquipment = { ...prevState.equipment };
      let updatedInventory = removeItemFromInventory(prevState.inventory, item.itemId);
      
      // Equip item logic remains the same
      if (item.slot === 'fingers') {
        const emptyFingerSlot = updatedEquipment.fingers.findIndex((finger) => finger === null);
        if (emptyFingerSlot !== -1) {
          updatedEquipment.fingers[emptyFingerSlot] = item;
        } else {
          alert('No available finger slot to equip this item.');
          return prevState;
        }
      } else {
        if (updatedEquipment[item.slot]) {
          if (updatedInventory.length >= maxInventorySpace) {
            alert('Inventory is full! Cannot unequip this item.');
            return prevState;
          }
          updatedInventory.push({ ...updatedEquipment[item.slot], quantity: 1 });
        }
        updatedEquipment[item.slot] = item;
      }
  
      return {
        ...prevState,
        equipment: updatedEquipment,
        inventory: updatedInventory,
      };
    });
  };  

  const removeItemFromInventory = (inventory, itemId, quantity = 1) => {
    return inventory
      .map((item) => {
        if (item.itemId === itemId) {
          if (item.quantity > quantity) {
            return { ...item, quantity: item.quantity - quantity };
          }
          return null; // Remove item if quantity hits 0
        }
        return item;
      })
      .filter(Boolean); // Remove null items
  };  

  const handleUseItem = (item) => {
    setGameState((prevState) => {
      const updatedInventory = removeItemFromInventory(prevState.inventory, item.itemId);
  
      // Apply the item's effect (e.g., healing)
      const updatedPlayer = { ...prevState.player };
      if (item.effect && item.effect.heal) {
        updatedPlayer.health = Math.min(
          updatedPlayer.maxHitPoints,
          updatedPlayer.health + item.effect.heal
        );
      }      
  
      return {
        ...prevState,
        inventory: updatedInventory,
        player: updatedPlayer,
      };
    });
    setItemOptions(null);
  };  

  const handleDropItem = (item, dropType) => {
    let quantityToDrop = 1;
    if (dropType === 'all') quantityToDrop = item.quantity;
    if (dropType === 'x') {
      const dropAmount = parseInt(prompt('How many would you like to drop?'), 10);
      quantityToDrop = !isNaN(dropAmount) && dropAmount > 0 ? Math.min(dropAmount, item.quantity) : 1;
    }
  
    setPlayer((prevPlayer) => {
      const updatedInventory = removeItemFromInventory(prevPlayer.inventory, item.itemId, quantityToDrop);
      return {
        ...prevPlayer,
        inventory: updatedInventory,
      };
    });
  
    setDropOptions(null);
    setItemOptions(null);
  };   

  const addItemToInventory = () => {
    const randomItem = itemConfig.items[Math.floor(Math.random() * itemConfig.items.length)];
    setPlayer((prevPlayer) => {
      const updatedInventory = [...prevPlayer.inventory];
      const existingItemIndex = updatedInventory.findIndex((i) => i.itemId === randomItem.itemId);

      if (existingItemIndex > -1) {
        if (randomItem.isQuestItem) {
          // Quest items cannot stack
          updatedInventory.push({ ...randomItem, quantity: 1 });
        } else {
          // Stack the item up to MAX_STACK_SIZE
          updatedInventory[existingItemIndex].quantity = Math.min(
            updatedInventory[existingItemIndex].quantity + 1,
            MAX_STACK_SIZE
          );
        }
      } else {
        updatedInventory.push({ ...randomItem, quantity: 1 });
      }

      // Ensure the inventory does not exceed max capacity for unique items
      if (updatedInventory.length > MAX_INVENTORY_CAPACITY) {
        alert('Inventory is full! Cannot add more unique items.');
        return prevPlayer;
      }

      return {
        ...prevPlayer,
        inventory: updatedInventory,
      };
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        itemOptions &&
        !event.target.closest(`.${styles.itemOptions}`) &&
        !event.target.closest(`.${styles.dropOptions}`)
      ) {
        setItemOptions(null);
        setDropOptions(null);
      }
    };
  
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);
  
    return () => {
      document.removeEventListener('click', handleClickOutside);
      clearTimeout(timeoutId);
      if (optionsTimeout.current) {
        clearTimeout(optionsTimeout.current);
      }
    };
  }, [itemOptions, dropOptions]);  

  useEffect(() => {
    const updatePosition = () => {
      if (!itemOptions) return; // If no item options are open, do nothing
  
      const slotElement = document.querySelector(`[data-index="${itemOptions.index}"]`);
      if (!slotElement) return; // If we can't find the slot, don't do anything
  
      const rect = slotElement.getBoundingClientRect();
      const bottomSpace = window.innerHeight - rect.bottom;
      const topSpace = rect.top;
  
      const position = bottomSpace < 150 
        ? { top: rect.top + window.scrollY - 150, left: rect.left + rect.width / 2 } // Above the slot
        : { top: rect.bottom + window.scrollY, left: rect.left + rect.width / 2 };  // Below the slot
  
      setItemOptions((prev) => ({
        ...prev,
        position, // Update the position
      }));
    };
  
    window.addEventListener('resize', updatePosition); // When window resizes, call updatePosition
  
    return () => {
      window.removeEventListener('resize', updatePosition); // Clean up the listener when component unmounts
    };
  }, [itemOptions]);   

  const getItemOptions = (item) => {
    if (!item) return [];
    const itemData = itemConfig.items.find((i) => i.itemId === item.itemId);
    if (!itemData) return []; // Avoid undefined errors
  
    if (dropOptions) {
      const createDropButton = (label, type) => (
        <button 
          key={type} 
          onClick={() => {
            if (type === 'x') {
              const dropAmount = parseInt(prompt('How many would you like to drop?'), 10);
              if (!isNaN(dropAmount) && dropAmount > 0) {
                handleDropItem(item, 'x', dropAmount);
              }
            } else {
              handleDropItem(item, type);
            }
          }}
        >
          {label}
        </button>
      );
  
      return (
        <div className={styles.dropOptions}>
          {createDropButton('Drop 1', 'one')}
          {createDropButton('Drop X', 'x')}
          {createDropButton('Drop All', 'all')}
          <button onClick={() => setDropOptions(null)}>Cancel</button>
        </div>
      );
    }
  
    const useText = {
      food: 'Eat',
      potion: 'Drink',
      default: 'Use'
    };
  
    const options = [];
    if (itemData.isUsable) {
      const action = useText[itemData.type] || useText.default;
      options.push(<button key="use" onClick={() => handleUseItem(itemData)}>{action}</button>);
    }
  
    if (itemData.type === 'weapon' || itemData.type === 'armor' || itemData.type === 'jewelry') {
      options.push(<button key="equip" onClick={() => handleEquipItem(itemData)}>Equip</button>);
    }
  
    options.push(<button key="drop" onClick={() => setDropOptions(true)}>Drop</button>);
  
    return options;
  };  

  return (
    <div className={styles.inventoryContainer}>
      <div className={styles.inventoryHeader}>
        <h2 className={styles.inventoryTitle}>Inventory ({inventory.length} / {MAX_INVENTORY_CAPACITY})</h2>
        <button className={styles.addItemButton} onClick={addItemToInventory}>Add Random Item</button>
      </div>
      <div className={styles.layout}>
        {inventory.map((item, index) => (
          <InventorySlot
            key={index}
            index={index}
            item={item}
            moveItem={handleMoveItem}
            onLeftClick={handleLeftClick}
            setItemOptions={setItemOptions} // Pass setItemOptions to clear it on drag
            data-index={index} // Attach index to help locate slot later
          />
        ))}
      </div>
      {itemOptions && (
        <div
          className={styles.itemOptions}
          style={{
            position: 'absolute',
            top: `${itemOptions.position.top}px`,
            left: `${itemOptions.position.left}px`,
            transform: 'translate(-50%, 0)', // Center horizontally
          }}
          onMouseEnter={handleMouseEnterOptions}
          onMouseLeave={handleMouseLeaveOptions}
        >
          <h4>{itemOptions.item.name}</h4>
          {getItemOptions(itemOptions.item)}
        </div>
      )}
    </div>
  );
}

const InventorySlot = React.memo(({ index, item, moveItem, onLeftClick, setItemOptions }) => {
  const slotRef = useRef(null);

  const [, dropRef] = useDrop({
    accept: ItemTypes.ITEM,
    hover: (draggedItem, monitor) => {
      if (!monitor.isOver({ shallow: true })) return;
      if (draggedItem.index === index) return;

      moveItem(draggedItem.index, index);
      draggedItem.index = index;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const [{ isDragging }, dragRef] = useDrag({
    type: ItemTypes.ITEM,
    item: () => {
      setItemOptions(null);
      return { index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const itemData = item ? itemConfig.items.find((i) => i.itemId === item.itemId) : null;
  const opacity = isDragging ? 0.5 : 1;

  return (
      <div
        ref={(el) => {
          slotRef.current = el;
          dropRef(el);
        }}
        className={`${styles.inventorySlot} ${dropRef.current?.isOver ? styles.highlightSlot : ''}`}
        onClick={() => onLeftClick(item, index, slotRef.current)} // Pass the slot element to calculate position
      >
      {item ? (
        <div
          ref={dragRef}
          className={`${styles.inventoryItem} ${itemData ? styles[itemData.rarity] : ''}`}
          style={{ opacity }}
        >
          <img
            src={`http://localhost:5000/assets/images/items/${itemData?.image}`}
            alt={itemData?.name}
            className={styles.itemImage}
          />
          <p>(x{item?.quantity})</p>
        </div>
      ) : null}
    </div>
  );
});

export default Inventory;
