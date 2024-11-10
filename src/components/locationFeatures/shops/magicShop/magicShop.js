// magicShop.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './magicShop.module.css';

function MagicShop({ isOpen, shopId }) {
  const [shopData, setShopData] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [playerGold, setPlayerGold] = useState(1000); // Example player gold value

  useEffect(() => {
    console.log('MagicShop isOpen:', isOpen, 'shopId:', shopId);
    if (isOpen && shopId) {
      const fetchShopData = async () => {
        try {
          // Fetch shop data
          const shopResponse = await axios.get(`http://localhost:5000/api/shops/${shopId}`);
          setShopData(shopResponse.data);

          // Fetch inventory data
          const inventoryResponse = await axios.get(`http://localhost:5000/api/shops/${shopId}/stock`);
          setInventory(inventoryResponse.data);
        } catch (error) {
          console.error("Failed to fetch shop or inventory data:", error);
        }
      };

      fetchShopData();
    }
  }, [isOpen, shopId]);

  if (!isOpen || !shopData) {
    return null;
  }

  const getItemImage = (item) => {
    if (item.item_image) {
      return `http://localhost:5000/assets/images/items/${item.item_image}.png`;
    } else {
      return `http://localhost:5000/assets/images/items/fallback.png`;
    }
  };

  const getOwnerImage = (ownerImage) => {
    if (ownerImage) {
      return `http://localhost:5000/assets/images/npcs/${ownerImage}`;
    } else {
      return `http://localhost:5000/assets/images/npcs/fallback.png`;
    }
  };

  const handleBuyItem = (item) => {
    if (playerGold >= item.price) {
      setPlayerGold((prevGold) => prevGold - item.price);
      setInventory((prevInventory) =>
        prevInventory.map((invItem) =>
          invItem.item_id === item.item_id
            ? { ...invItem, quantity: invItem.quantity - 1 }
            : invItem
        )
      );
      console.log(`Purchased ${item.item_name}`);
    } else {
      alert("Not enough gold to purchase this item.");
    }
  };

  return (
    <div className={styles.magicShopContainer}>
      <h2>{shopData.shop_name}</h2>
      <div className={styles.shopOwnerContainer}>
        <p className={styles.shopOwnerGreeting}>{shopData.shop_greeting}</p>
        <img
          src={getOwnerImage(shopData.owner_image)}
          alt={shopData.shop_owner}
          className={styles.shopOwnerImage}
          onError={(e) => { e.target.onerror = null; e.target.src = "http://localhost:5000/assets/images/npcs/fallback.png"; }}
        />
        <p>Shop Owner: {shopData.shop_owner}</p>
      </div>
      <div className={styles.inventoryContainer}>
        {inventory.length > 0 ? (
          <div className={styles.itemList}>
            {inventory.map((item, index) => (
              <div key={index} className={styles.item}>
                <img 
                  src={getItemImage(item)} 
                  alt={item.item_name} 
                  className={styles.itemImage} 
                  onError={(e) => { e.target.onerror = null; e.target.src = "http://localhost:5000/assets/images/items/fallback.png"; }}
                />
                <h4>{item.item_name}</h4>
                <p>Price: {item.price} gold</p>
                <p>Quantity: {item.quantity}</p>
                <button 
                  className={styles.buyButton} 
                  onClick={() => handleBuyItem(item)}
                  disabled={item.quantity <= 0}
                >
                  {item.quantity > 0 ? 'Buy' : 'Sold Out'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No items available for sale.</p>
        )}
      </div>
      <div className={styles.playerGold}>Player Gold: {playerGold} gold</div>
    </div>
  );
}

export default MagicShop;
