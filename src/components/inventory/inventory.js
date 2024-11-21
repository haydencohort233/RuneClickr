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

      setItemOptions({
        item,
        index,
        position: {
          top: rect.bottom + window.scrollY, // Position below the inventory slot
          left: rect.left + rect.width / 2, // Center horizontally
        },
      });

      // Clear any existing timeout to reset the 5-second timer
      if (optionsTimeout.current) {
        clearTimeout(optionsTimeout.current);
      }

      // Auto-dismiss the options after 5 seconds if the mouse isn't inside
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
      const equipmentSlot = item.slot;
      let updatedEquipment = { ...prevState.equipment };
      let updatedInventory = [...prevState.inventory];

      // Remove the item from inventory
      const itemIndex = updatedInventory.findIndex((i) => i.itemId === item.itemId);
      if (itemIndex > -1) {
        if (updatedInventory[itemIndex].quantity > 1) {
          updatedInventory[itemIndex].quantity -= 1;
        } else {
          updatedInventory.splice(itemIndex, 1);
        }
      }

    // Equip the item in the appropriate slot
    if (equipmentSlot === 'fingers') {
      const emptyFingerSlot = updatedEquipment.fingers.findIndex((finger) => finger === null);
      if (emptyFingerSlot !== -1) {
        updatedEquipment.fingers[emptyFingerSlot] = item;
      } else {
        alert('No available finger slot to equip this item.');
        return prevState;
      }
    } else {
      if (updatedEquipment[equipmentSlot]) {
        // Unequip current item and add back to inventory
        if (updatedInventory.length >= maxInventorySpace) {
          alert('Inventory is full! Cannot unequip this item.');
          return prevState;
        }
        updatedInventory.push({ ...updatedEquipment[equipmentSlot], quantity: 1 });
      }
      updatedEquipment[equipmentSlot] = item;
    }

      return {
        ...prevState,
        equipment: updatedEquipment,
        inventory: updatedInventory,
      };
    });
  };

  const handleUseItem = (item) => {
    setGameState((prevState) => {
      let updatedInventory = [...prevState.inventory];
      let updatedPlayer = { ...prevState.player };

      // Remove the item from inventory
      const itemIndex = updatedInventory.findIndex((i) => i.itemId === item.itemId);
      if (itemIndex > -1) {
        if (updatedInventory[itemIndex].quantity > 1) {
          updatedInventory[itemIndex].quantity -= 1;
        } else {
          updatedInventory.splice(itemIndex, 1);
        }
      }

      // Apply the item's effect (e.g., healing)
      if (item.effect && item.effect.heal) {
        updatedPlayer.health = Math.min(
          updatedPlayer.maxHealth,
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
    setPlayer((prevPlayer) => {
      let updatedInventory = [...prevPlayer.inventory];
      const itemIndex = updatedInventory.findIndex((i) => i.itemId === item.itemId);

      if (itemIndex > -1) {
        switch (dropType) {
          case 'one':
            if (updatedInventory[itemIndex].quantity > 1) {
              updatedInventory[itemIndex].quantity -= 1;
            } else {
              updatedInventory.splice(itemIndex, 1);
            }
            break;
          case 'all':
            updatedInventory.splice(itemIndex, 1);
            break;
          case 'x':
            const dropAmount = prompt('How many would you like to drop?');
            if (dropAmount > 0 && dropAmount < updatedInventory[itemIndex].quantity) {
              updatedInventory[itemIndex].quantity -= dropAmount;
            } else if (dropAmount >= updatedInventory[itemIndex].quantity) {
              updatedInventory.splice(itemIndex, 1);
            }
            break;
          default:
            break;
        }
      }

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
      if (itemOptions && !event.target.closest(`.${styles.itemOptions}`) && !event.target.closest(`.${styles.dropOptions}`)) {
        setItemOptions(null);
        setDropOptions(null);
      }
    };

    // Delay adding the event listener slightly to avoid immediate dismissal
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      clearTimeout(timeoutId);
      // Clean up timeout when the component unmounts
      if (optionsTimeout.current) {
        clearTimeout(optionsTimeout.current);
      }
    };
  }, [itemOptions, dropOptions]);

  const getItemOptions = (item) => {
    if (!item) return [];
    const itemData = itemConfig.items.find((i) => i.itemId === item.itemId);
    if (!itemData) return [];

    if (dropOptions) {
      return (
        <div className={styles.dropOptions}>
          <button onClick={() => handleDropItem(item, 'one')}>Drop 1</button>
          <button onClick={() => handleDropItem(item, 'x')}>Drop X</button>
          <button onClick={() => handleDropItem(item, 'all')}>Drop All</button>
          <button onClick={() => setDropOptions(null)}>Cancel</button>
        </div>
      );
    }

    const options = [];
    if (itemData.isUsable) {
      if (itemData.type === 'food') {
        options.push(<button key="eat" onClick={() => { handleUseItem(itemData); }}>Eat</button>);
      } else if (itemData.type === 'potion') {
        options.push(<button key="drink" onClick={() => { handleUseItem(itemData); }}>Drink</button>);
      } else {
        options.push(<button key="use" onClick={() => { handleUseItem(itemData); }}>Use</button>);
      }
    }
    if (itemData.type === 'weapon' || itemData.type === 'armor' || itemData.type === 'jewelry') {
      options.push(<button key="equip" onClick={() => { handleEquipItem(itemData); setItemOptions(null); }}>Equip</button>);
    }
    options.push(<button key="drop" onClick={() => { setDropOptions(true); }}>Drop</button>);

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

function InventorySlot({ index, item, moveItem, onLeftClick, setItemOptions }) {
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
      // Dismiss item options when dragging starts
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
}

export default Inventory;
