// /components/banking/banking.js
import React, { useCallback, useState, useEffect } from 'react';
import styles from './banking.module.css';
import bankUpgradeConfig from './bankUpgradeConfig.json';

const MAX_BANK_SPACE = bankUpgradeConfig.maxBankSpaces;

function Banking({ gameState, setGameState }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, item: null });
  const [bankContextMenu, setBankContextMenu] = useState({ visible: false, x: 0, y: 0, item: null });

  // Check if the player owns the Bank building
  const ownsBank = gameState.buildings?.Bank && gameState.buildings.Bank.count > 0;

  const handleDepositItem = useCallback((item, quantity = 1) => {
    setGameState((prevState) => {
      const updatedInventory = [...prevState.inventory];
      const updatedBank = [...prevState.bank];

      const itemIndex = updatedInventory.findIndex((i) => i.itemId === item.itemId);
      if (itemIndex > -1) {
        if (updatedInventory[itemIndex].quantity >= quantity) {
          // Handle inventory reduction
          if (updatedInventory[itemIndex].quantity > quantity) {
            updatedInventory[itemIndex].quantity -= quantity;
          } else {
            updatedInventory.splice(itemIndex, 1);
          }

          // Handle bank addition
          const bankItemIndex = updatedBank.findIndex((i) => i.itemId === item.itemId);
          if (bankItemIndex > -1) {
            updatedBank[bankItemIndex].quantity = Math.min(
              updatedBank[bankItemIndex].quantity + quantity,
              65535 // Assuming stackable limit
            );
          } else if (updatedBank.length < gameState.bankSpace) {
            updatedBank.push({ ...item, quantity });
          } else {
            alert('Bank is full! Cannot deposit more items.');
            return prevState;
          }
        } else {
          alert('Not enough items to deposit that amount.');
          return prevState;
        }
      }

      return {
        ...prevState,
        inventory: updatedInventory,
        bank: updatedBank,
      };
    });
  }, [setGameState]);

  const handleWithdrawItem = useCallback((item, quantity = 1) => {
    setGameState((prevState) => {
      const updatedBank = [...prevState.bank];
      const updatedInventory = [...prevState.inventory];

      const itemIndex = updatedBank.findIndex((i) => i.itemId === item.itemId);
      if (itemIndex > -1) {
        if (updatedBank[itemIndex].quantity >= quantity) {
          // Handle bank reduction
          if (updatedBank[itemIndex].quantity > quantity) {
            updatedBank[itemIndex].quantity -= quantity;
          } else {
            updatedBank.splice(itemIndex, 1);
            // Dismiss options if the item is fully withdrawn from the bank
            setSelectedItem(null);
          }

          // Handle inventory addition
          const inventoryItemIndex = updatedInventory.findIndex((i) => i.itemId === item.itemId);
          if (inventoryItemIndex > -1) {
            // Add to existing stack if it exists, regardless of inventory space
            updatedInventory[inventoryItemIndex].quantity = Math.min(
              updatedInventory[inventoryItemIndex].quantity + quantity,
              65535
            );
          } else {
            // Only add a new item if there is space in the inventory
            if (updatedInventory.length >= prevState.maxInventorySpace) {
              alert('Inventory is full! Cannot withdraw more items.');
              return prevState;
            }
            updatedInventory.push({ ...item, quantity });
          }
        } else {
          alert('Not enough items to withdraw that amount.');
          return prevState;
        }
      }

      return {
        ...prevState,
        inventory: updatedInventory,
        bank: updatedBank,
      };
    });
  }, [setGameState]);

  const getBankUpgradeCost = () => {
    const { initialCost, costIncrementMultiplier } = bankUpgradeConfig;
    return Math.floor(initialCost * Math.pow(costIncrementMultiplier, gameState.bankSpacesBought));
  };

  const purchaseBankSpace = () => {
    const currentCost = getBankUpgradeCost();

    if (gameState.currency >= currentCost) {
      if (gameState.bankSpace < MAX_BANK_SPACE) {
        setGameState((prevState) => ({
          ...prevState,
          currency: prevState.currency - currentCost,
          bankSpace: Math.min(prevState.bankSpace + 10, MAX_BANK_SPACE), // Example increment
          bankSpacesBought: prevState.bankSpacesBought + 1,
        }));
      } else {
        alert('Maximum bank space reached.');
      }
    } else {
      alert('Not enough currency to purchase more bank space.');
    }
  };

  const resetBankSpace = () => {
    setGameState((prevState) => ({
      ...prevState,
      bankSpace: bankUpgradeConfig.initialBankSpaces,
      bankSpacesBought: 0,
    }));
  };

  const handleRightClickInventory = (event, item) => {
    event.preventDefault();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      item,
    });
  };

  const handleRightClickBank = (event, item) => {
    event.preventDefault();
    setBankContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      item,
    });
  };

  const handleContextMenuOption = (option) => {
    if (contextMenu.item) {
      if (option === "Deposit 1") {
        handleDepositItem(contextMenu.item, 1);
      } else if (option === "Deposit X") {
        const amount = parseInt(prompt("Enter the amount to deposit:"), 10);
        if (!isNaN(amount) && amount > 0) {
          handleDepositItem(contextMenu.item, amount);
        }
      } else if (option === "Deposit All") {
        handleDepositItem(contextMenu.item, contextMenu.item.quantity);
      }
    }
    setContextMenu({ visible: false, x: 0, y: 0, item: null });
  };

  const handleBankContextMenuOption = (option) => {
    if (bankContextMenu.item) {
      if (option === "Withdraw 1") {
        handleWithdrawItem(bankContextMenu.item, 1);
      } else if (option === "Withdraw X") {
        const amount = parseInt(prompt("Enter the amount to withdraw:"), 10);
        if (!isNaN(amount) && amount > 0) {
          handleWithdrawItem(bankContextMenu.item, amount);
        }
      } else if (option === "Withdraw All") {
        handleWithdrawItem(bankContextMenu.item, bankContextMenu.item.quantity);
      }
    }
    setBankContextMenu({ visible: false, x: 0, y: 0, item: null });
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        setContextMenu({ visible: false, x: 0, y: 0, item: null });
      }
      if (bankContextMenu.visible) {
        setBankContextMenu({ visible: false, x: 0, y: 0, item: null });
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu, bankContextMenu]);

  return ownsBank ? (
    <div className={styles.bankingContainer}>
      <h2 className={styles.bankingTitle}>Bank ({gameState.bank.length} / {gameState.bankSpace})</h2>
      <div className={styles.bankingSlots}>
        {gameState.bank.map((item, index) => (
          <div
            key={index}
            className={styles.bankSlot}
            onClick={() => setSelectedItem(item)}
            onContextMenu={(e) => handleRightClickBank(e, item)}
          >
            <img src={`http://localhost:5000/assets/images/items/${item.image}`} alt={item.name} />
            <p>(x{item.quantity})</p>
          </div>
        ))}
      </div>
      {selectedItem && (
        <div className={styles.itemActions}>
          <h4>{selectedItem.name}</h4>
          <button className={styles.withdrawOne} onClick={() => handleWithdrawItem(selectedItem, 1)}>Withdraw 1</button>
          <button className={styles.withdrawFive} onClick={() => handleWithdrawItem(selectedItem, 5)}>Withdraw 5</button>
          <button className={styles.withdrawAll} onClick={() => handleWithdrawItem(selectedItem, selectedItem.quantity)}>Withdraw All</button>
          <button className={styles.cancelButton} onClick={() => setSelectedItem(null)}>Cancel</button>
        </div>
      )}
      <div className={styles.bankUpgradeContainer}>
        <h3>Upgrade Bank Space</h3>
        <button onClick={purchaseBankSpace} className={styles.upgradeButton}>
          Buy More Bank Space (Cost: {getBankUpgradeCost()} Currency)
        </button>
        <button onClick={resetBankSpace} className={`${styles.upgradeButton} ${styles.resetButton}`}>Reset Bank Space [Dev]</button>
      </div>
      <h2 className={styles.inventoryTitle}>Inventory ({gameState.inventory.length} / {gameState.maxInventorySpace})</h2>
      <div className={styles.inventorySlots}>
        {gameState.inventory.map((item, index) => (
          <div
            key={index}
            className={styles.inventorySlot}
            onClick={() => handleDepositItem(item, 1)}
            onContextMenu={(e) => handleRightClickInventory(e, item)}
          >
            <img src={`http://localhost:5000/assets/images/items/${item.image}`} alt={item.name} />
            <p>(x{item.quantity})</p>
          </div>
        ))}
      </div>
      {contextMenu.visible && (
        <div
          className={styles.contextMenu}
          style={{ top: contextMenu.y, left: contextMenu.x, position: 'absolute' }}
        >
          <button onClick={() => handleContextMenuOption("Deposit 1")}>Deposit 1</button>
          <button onClick={() => handleContextMenuOption("Deposit X")}>Deposit X</button>
          <button onClick={() => handleContextMenuOption("Deposit All")}>Deposit All</button>
        </div>
      )}
      {bankContextMenu.visible && (
        <div
          className={styles.bankContextMenu}
          style={{ top: bankContextMenu.y, left: bankContextMenu.x, position: 'absolute' }}
        >
          <button onClick={() => handleBankContextMenuOption("Withdraw 1")}>Withdraw 1</button>
          <button onClick={() => handleBankContextMenuOption("Withdraw X")}>Withdraw X</button>
          <button onClick={() => handleBankContextMenuOption("Withdraw All")}>Withdraw All</button>
        </div>
      )}
    </div>
      ) : (
        <div className={styles.bankingContainer}>
            <img
                src="http://localhost:5000/assets/images/icons/bank_icon.png"
                alt="Bank Icon"
                className={styles.bankIcon}
            />
            <h2 className={styles.bankingTitle}>Bank Locked</h2>
            <p>You need to purchase the Bank building to use this feature.</p>
        </div>
      );
}

export default Banking;
