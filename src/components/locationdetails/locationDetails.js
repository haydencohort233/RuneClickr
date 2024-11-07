//function LocationDetails({ currentLocation }) {
//This is the main functional component for displaying the details of a specific location.
//It takes 'currentLocation' as a prop, which contains the details about the location.
//
//const [selectedFeature, setSelectedFeature] = useState(null);
//This useState hook maintains the state of the currently selected feature within the location, such as a shop or other interactive element.
//
//const renderFeatureComponent = () => {
//This function returns the corresponding component based on the selected feature. Currently, it supports 'Aggie's Magic Shop' as an example.
//
//<div className={styles.featureDetailsContainer}>
//This container is used to render the selected feature component, such as the Magic Shop. It will only display if a feature is selected.
//
import React, { useState } from 'react';
import MagicShop from '../locationFeatures/draynormansion/magicShop';
import styles from './locationDetails.module.css';

function LocationDetails({ currentLocation }) {
  const [selectedFeature, setSelectedFeature] = useState(null);

  if (!currentLocation) {
    return null;
  }

  const { name, description, features = [] } = currentLocation;

  const handleFeatureClick = (feature) => {
    setSelectedFeature((prevFeature) => (prevFeature === feature ? null : feature));
  };

  const renderFeatureComponent = () => {
    switch (selectedFeature) {
      case 'Aggie\'s Magic Shop':
        return <MagicShop isOpen={true} shopId={1} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.locationDetailsContainer}>
      <h2>{name}</h2>
      <p>{description}</p>
      <div className={styles.featuresContainer}>
        <h3>Available Features:</h3>
        <ul>
          {features.length > 0 ? (
            features.map((feature, index) => (
              <li key={index} onClick={() => handleFeatureClick(feature)} className={styles.featureItem}>
                {feature}
              </li>
            ))
          ) : (
            <li>No features available</li>
          )}
        </ul>
      </div>
      <div className={styles.featureDetailsContainer}>
        {renderFeatureComponent()}
      </div>
    </div>
  );
}

export default LocationDetails;
