import React, { useState, useEffect } from 'react';
import styles from './locationDetails.module.css';
import featureRegistry from '../locationFeatures/featureRegistry';
import features from '../worldmap/features.json'; // All available features
import locations from '../worldmap/worldLocations.json'; // Add a locations data file
import Enemy from '../enemy/enemy';
import Combat from '../combat/combat';
import getDropItems from '../drops/getDropItems';

function LocationDetails({ currentLocation, player, setPlayer, gainExperience, setLevelUpMessage, onEnemyDefeat }) {
  const [locationData, setLocationData] = useState(null); // Holds full location data
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [shopData, setShopData] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [inCombat, setInCombat] = useState(false);
  const [currentEnemy, setCurrentEnemy] = useState(null);

  // Resolve currentLocation to full location data
  useEffect(() => {
    if (typeof currentLocation === 'string') {
      // Find full location details by ID
      const locationDetails = locations.find((loc) => loc.id === currentLocation);
      if (locationDetails) {
        setLocationData(locationDetails);
      } else {
        console.error(`Location with ID "${currentLocation}" not found.`);
        setLocationData(null);
      }
    } else if (typeof currentLocation === 'object' && currentLocation !== null) {
      // If already an object, use as-is
      setLocationData(currentLocation);
    } else {
      console.error('Invalid currentLocation:', currentLocation);
      setLocationData(null);
    }
  }, [currentLocation]);

  // Debugging logs
  useEffect(() => {
    if (locationData) {
      console.log('Resolved Location Data:', locationData);
      console.log('Enemies:', locationData.enemies || []);
      console.log('Is enemies an array?', Array.isArray(locationData.enemies));
      console.log('Features (feature_ids):', locationData.feature_ids || []);
      console.log('Available Features:', features.filter((f) => locationData.feature_ids?.includes(f.id)) || []);
    }
  }, [locationData]);

  if (!locationData) {
    return <p>Loading location data...</p>;
  }

  const { name, description, feature_ids = [], locationPhoto, enemies = [] } = locationData;

  const availableFeatures = features.filter((feature) => feature_ids.includes(feature.id));

  const handleFeatureClick = (feature) => {
    setSelectedFeature((prevFeature) => (prevFeature === feature ? null : feature));
  };

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
          gainExperience={gainExperience}
        />
      ) : (
        <div className={styles.featureFallback}>Feature "{selectedFeature.name}" not available.</div>
      );
    }
    return null;
  };

  const handleStartCombat = (enemy) => {
    setInCombat(true);
    setCurrentEnemy(enemy);
  };

  const handleCombatEnd = () => {
    if (currentEnemy) {
      const experienceGained = currentEnemy.experience || 0;
      const droppedItems = getDropItems(currentEnemy.type);

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
  
      {/* Conditionally render featureDetailsContainer */}
      {selectedFeature && (
        <div className={styles.featureDetailsContainer}>
          {renderFeatureComponent()}
        </div>
      )}
  
      {enemies.length > 0 && !inCombat && (
        <div className={styles['enemy-container']}>
          <Enemy locationId={locationData.id} onStartCombat={handleStartCombat} />
        </div>
      )}
  
      {inCombat && currentEnemy && (
        <Combat enemy={currentEnemy} player={player} setPlayer={setPlayer} onCombatEnd={handleCombatEnd} />
      )}
    </div>
  );  
}

export default LocationDetails;
