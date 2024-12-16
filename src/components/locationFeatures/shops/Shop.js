import React, { useState, useEffect } from 'react';
import styles from './shop.module.css';
import shops from './shops.json';

function Shop({ shopId, gameState, setGameState }) {
  const [shopData, setShopData] = useState(null);

  useEffect(() => {
    // Find the shop data using the shopId
    const shop = shops.find((shop) => shop.id === shopId);
    if (shop) {
      setShopData(shop);
    } else {
      console.error(`Shop with ID ${shopId} not found`);
    }
  }, [shopId]);

  const handlePurchase = (item) => {
    if (gameState.currency < item.price) {
      alert("Not enough currency to purchase this item!");
      return;
    }

    // Deduct currency and add item to inventory
    setGameState((prevState) => ({
      ...prevState,
      currency: prevState.currency - item.price,
      inventory: [
        ...prevState.inventory,
        { ...item, quantity: 1 } // Add the item with quantity 1
      ]
    }));
  };

  if (!shopData) {
    return <div className={styles.shopContainer}>Loading shop...</div>;
  }

  return (
    <div className={styles.shopContainer}>
      <h2 className={styles.shopTitle}>{shopData.shop_name}</h2>
      <img
        src={`/assets/images/shops/${shopData.owner_image}`}
        alt={shopData.shop_owner}
        className={styles.shopOwnerImage}
        onError={(e) => (e.target.src = '/assets/images/shops/fallback.png')}
      />
      <p className={styles.shopOwner}>Owner: {shopData.shop_owner}</p>
      <div className={styles.shopItems}>
        {shopData.stock.map((item) => (
          <div key={item.id} className={styles.shopItem}>
            <img
              src={`/assets/images/items/${item.item_image}`}
              alt={item.item_name}
              className={styles.itemImage}
              onError={(e) => (e.target.src = '/assets/images/items/fallback.png')}
            />
            <h4>{item.item_name}</h4>
            <p>Price: {item.price} gold</p>
            <button
              onClick={() => handlePurchase(item)}
              disabled={gameState.currency < item.price}
              className={styles.purchaseButton}
            >
              Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Shop;
