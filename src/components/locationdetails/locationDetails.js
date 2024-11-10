import React, { useState, useEffect } from 'react';
import styles from './locationDetails.module.css';
import featureRegistry from '../locationFeatures/featureRegistry';
import features from '../worldmap/features.json';  // Import features.json
import axios from 'axios';

function LocationDetails({ currentLocation }) {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [shopData, setShopData] = useState(null);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    if (!selectedFeature) {
      console.log('No feature selected.');
      setShopData(null); // Reset shop data if no feature is selected
      setInventory([]); // Reset inventory
    } else {
      console.log('Selected feature:', selectedFeature);

      // Fetch shop data if the selected feature is a shop
      if (selectedFeature.type === 'shop' && selectedFeature.shopId) {
        axios.get(`http://localhost:5000/api/shops/${selectedFeature.shopId}`)
          .then((response) => {
            setShopData(response.data);
          })
          .catch((error) => {
            console.error("Failed to fetch shop data:", error);
          });

        axios.get(`http://localhost:5000/api/shops/${selectedFeature.shopId}/stock`)
          .then((response) => {
            setInventory(response.data);
          })
          .catch((error) => {
            console.error("Failed to fetch inventory data:", error);
          });
      }
    }
  }, [selectedFeature]);

  if (!currentLocation) {
    return null;
  }

  const { name, description, feature_ids = [], locationPhoto } = currentLocation;

  // Get the feature details based on feature_ids
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
        />
      ) : null;
    }
    return null;
  };

  return (
    <div className={styles.locationDetailsContainer}>
      <h2>{name}</h2>
      <p>{description}</p>
      {locationPhoto ? (
        <div className={styles.locationPhotoContainer}>
          <img 
            src={`http://localhost:5000/assets/images/locations/${locationPhoto}`} 
            alt={`${name} photo`} 
            className={styles.locationPhoto} 
            onError={(e) => { e.target.src = 'http://localhost:5000/assets/images/locations/fallback.png'; }}
          />
        </div>
      ) : (
        <div className={styles.locationPhotoContainer}>
          <img 
            src={`http://localhost:5000/assets/images/locations/fallback.png`} 
            alt={`${name} fallback photo`} 
            className={styles.locationPhoto} 
          />
        </div>
      )}
      <div className={styles.featuresContainer}>
        <h3>Available Features:</h3>
        <ul>
          {availableFeatures.length > 0 ? (
            availableFeatures.map((feature, index) => (
              <li
                key={index}
                onClick={() => handleFeatureClick(feature)}
                className={styles.featureItem}
              >
                {feature.name}
              </li>
            ))
          ) : (
            <li>Nothing interesting to do here..</li>
          )}
        </ul>
      </div>
      <div className={`${styles.featureDetailsContainer} ${selectedFeature ? styles.hasContent : ''}`}>
        {renderFeatureComponent()}
      </div>
    </div>
  );
}

export default LocationDetails;
