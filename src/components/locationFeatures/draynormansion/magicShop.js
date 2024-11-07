// magicShop.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './magicShop.module.css';

function MagicShop({ isOpen, shopId }) {
  const [shopData, setShopData] = useState(null);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    if (isOpen && shopId) {
      // Fetch shop data
      axios.get(`http://localhost:5000/api/shops/${shopId}`)
        .then((response) => {
          setShopData(response.data);
        })
        .catch((error) => {
          console.error("Failed to fetch shop data:", error);
        });

      // Fetch inventory data
      axios.get(`http://localhost:5000/api/shops/${shopId}/stock`)
        .then((response) => {
          setInventory(response.data);
        })
        .catch((error) => {
          console.error("Failed to fetch inventory data:", error);
        });
    }
  }, [isOpen, shopId]);

  if (!isOpen || !shopData) {
    return null;
  }

  const getItemImage = (item) => {
    try {
      return require(`../../../assets/images/items/${item.item_image || 'item_dwarfremains'}.png`);
    } catch (error) {
      return require(`../../../assets/images/items/item_dwarfremains.png`);
    }
  };

  return (
    <div className={styles.magicShopContainer}>
      <h2>{shopData.shop_name}</h2>
      <div className={styles.shopOwnerContainer}>
        <p className={styles.shopOwnerGreeting}>{shopData.shop_greeting}</p>
        <img
          src={require(`../../../assets/images/npcs/${shopData.owner_image}`)}
          alt={shopData.shop_owner}
          className={styles.shopOwnerImage}
        />
        <p>Shop Owner: {shopData.shop_owner}</p>
      </div>
      <div className={styles.inventoryContainer}>
        {inventory.length > 0 ? (
          <div className={styles.itemList}>
            {inventory.map((item, index) => (
              <div key={index} className={styles.item}>
                <img src={getItemImage(item)} alt={item.item_name} className={styles.itemImage} />
                <h4>{item.item_name}</h4>
                <p>Price: {item.price} gold</p>
                <p>Quantity: {item.quantity}</p>
                <button className={styles.buyButton}>Buy</button>
              </div>
            ))}
          </div>
        ) : (
          <p>No items available for sale.</p>
        )}
      </div>
    </div>
  );
}

export default MagicShop;
