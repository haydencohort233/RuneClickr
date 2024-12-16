import React, { useState, useEffect } from 'react';
import styles from './locationDetails.module.css';
import featureRegistry from '../locationFeatures/featureRegistry';
import features from '../worldmap/features.json';
import shops from '../locationFeatures/shops/shops.json'; // Ensure shops.json is an array
import Enemy from '../enemy/enemy';
import Combat from '../combat/combat';
import getDropItems from '../drops/getDropItems';

console.log('Shops:', shops); // Debugging log to ensure shops are loaded
console.log('Is shops an array?', Array.isArray(shops)); // Make sure shops is an array

function LocationDetails({ currentLocation, player, setPlayer, gainExperience, setLevelUpMessage, onEnemyDefeat }) {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [shopData, setShopData] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [inCombat, setInCombat] = useState(false);
  const [currentEnemy, setCurrentEnemy] = useState(null);

  // Load shop data when a feature is selected
  useEffect(() => {
    if (!selectedFeature) {
      setShopData(null);
      setInventory([]);
    } else {
      console.log('Selected feature:', selectedFeature);

      // Check if the selected feature is a shop and load its data
      if (selectedFeature?.type === 'shop' && selectedFeature?.shopId) {
        if (Array.isArray(shops)) {
          const shop = shops.find((shop) => shop.id === selectedFeature.shopId);
          if (shop) {
            setShopData(shop);
            setInventory(shop.stock);
          } else {
            console.warn(`Shop with ID ${selectedFeature.shopId} not found.`);
            setShopData(null);
            setInventory([]);
          }
        } else {
          console.error('Shops is not an array. Check your import or shops.json structure.');
          setShopData(null);
          setInventory([]);
        }
      }
    }
  }, [selectedFeature]);

  if (!currentLocation) {
    return null;
  }

  const { name, description, feature_ids = [], locationPhoto, enemies = [] } = currentLocation;

  // Filter available features for this location
  const availableFeatures = features.filter((feature) => feature_ids.includes(feature.id));

  // Handles clicking on a feature to select/deselect it
  const handleFeatureClick = (feature) => {
    setSelectedFeature((prevFeature) => (prevFeature === feature ? null : feature));
  };

  // Renders the dynamic feature component (like Shop, Banking, etc.)
  const renderFeatureComponent = () => {
    if (selectedFeature) {
      const FeatureComponent = featureRegistry[selectedFeature.component];
      return FeatureComponent ? (
        <FeatureComponent
          isOpen={true}
          shopId={selectedFeature.shopId}
          shopData={shopData}
          inventory={inventory}
          gameState={player}
          setGameState={setPlayer}
          skills={player.skills}
          gainExperience={(skillName, exp) =>
            gainExperience(player, setPlayer, skillName, exp, setLevelUpMessage)
          }
        />
      ) : (
        <div className={styles.featureFallback}>Feature "{selectedFeature.name}" not available.</div>
      );
    }
    return null;
  };

  // Handles starting combat with an enemy
  const handleStartCombat = (enemy) => {
    setInCombat(true);
    setCurrentEnemy(enemy);
  };

  // Handles combat end (player wins)
  const handleCombatEnd = () => {
    if (currentEnemy) {
      const experienceGained = currentEnemy.experience || 0;
      const droppedItems = getDropItems(currentEnemy.type);

      // Update player with experience and new items
      setPlayer((prevPlayer) => {
        let updatedInventory = [...prevPlayer.inventory];

        droppedItems.forEach((item) => {
          const existingItemIndex = updatedInventory.findIndex((i) => i.itemId === item.itemId);
          if (existingItemIndex >= 0 && updatedInventory[existingItemIndex].quantity < 25) {
            updatedInventory[existingItemIndex].quantity += item.quantity;
          } else if (updatedInventory.length < prevPlayer.maxInventorySpace) {
            updatedInventory.push({ ...item, quantity: item.quantity });
          }
        });

        return {
          ...prevPlayer,
          experience: (prevPlayer.experience || 0) + experienceGained,
          inventory: updatedInventory,
        };
      });
    }

    setInCombat(false);
    setCurrentEnemy(null);
    if (onEnemyDefeat) onEnemyDefeat();
  };

  return (
    <div className={styles.locationDetailsContainer}>
      <h2 className={styles.locationTitle}>{name}</h2>
      <p className={styles.locationDescription}>{description}</p>

      <div className={styles.locationPhotoContainer}>
        <img
          src={`http://localhost:5000/assets/images/locations/${locationPhoto || 'fallback.png'}`}
          alt={name}
          className={styles.locationPhoto}
          onError={(e) => {
            e.target.src = 'http://localhost:5000/assets/images/locations/fallback.png';
          }}
        />
      </div>

      <div className={styles.featuresContainer}>
        <h3 className={styles.featuresTitle}>Available Features:</h3>
        <ul className={styles.featuresList}>
          {availableFeatures.length > 0 ? (
            availableFeatures.map((feature) => (
              <li
                key={feature.id}
                onClick={() => handleFeatureClick(feature)}
                className={styles.featureItem}
              >
                {feature.name}
              </li>
            ))
          ) : (
            <li className={styles.noFeaturesMessage}>Nothing interesting to do here...</li>
          )}
        </ul>
      </div>

      <div className={styles.featureDetailsContainer}>
        {renderFeatureComponent()}
      </div>

      {enemies.length > 0 && !inCombat && (
        <div className={styles.enemiesContainer}>
          <Enemy locationId={currentLocation.id} onStartCombat={handleStartCombat} />
        </div>
      )}

      {inCombat && currentEnemy && (
        <Combat enemy={currentEnemy} player={player} setPlayer={setPlayer} onCombatEnd={handleCombatEnd} />
      )}
    </div>
  );
}

export default LocationDetails;
