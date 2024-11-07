// worldMap.js
import React, { useState, useEffect } from 'react';
import styles from './worldMap.module.css';
import worldLocations from './worldLocations.json';
import mapIcon from '../../assets/images/icons/map.png';
import worldMapImage from '../../assets/images/worldmap/worldmap.png';
import markerAvailable from '../../assets/images/worldmap/icons/marker_available.png';
import markerUnavailable from '../../assets/images/worldmap/icons/marker_unavailable.png';

function WorldMap({ gameState, setGameState }) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    if (gameState.travel && gameState.travel.isTraveling) {
      setTimeRemaining(gameState.travel.timeRemaining);
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            clearInterval(timer);
            return 0;
          }
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setTimeRemaining(null);
    }
  }, [gameState.travel]);

  // Toggle map visibility
  const toggleMap = () => {
    setIsMapOpen((prev) => !prev);
  };

  // Handle traveling prompt to a specific location
  const promptTravelToLocation = (location) => {
    if (gameState.currentLocation === location.id) {
      console.log("You are already at this location.");
      return;
    }

    const confirmTravel = window.confirm(`Do you want to travel to ${location.name}?`);
    if (confirmTravel) {
      startTravel(location);
    }
  };

  // Start traveling to the selected location
  const startTravel = (location) => {
    console.log(`Begin traveling to ${location.name}`);

    // Set travel state in gameState
    setGameState((prevState) => {
      const newGameState = {
        ...prevState,
        travel: {
          currentLocation: prevState.currentLocation,
          destination: location.name,
          timeRemaining: location.travelTime, // Use location's configurable travel time
          isTraveling: true,
        },
      };
      console.log("Updated Game State (Start Travel): ", newGameState);
      return newGameState;
    });

    // Update gameState once travel is complete
    setTimeout(() => {
      setGameState((prevState) => {
        const completedGameState = {
          ...prevState,
          currentLocation: location.id,
          travel_count: (prevState.travel_count || 0) + 1,
          travel: {
            currentLocation: location.id,
            destination: '',
            timeRemaining: 0,
            isTraveling: false,
          },
        };
        console.log("Updated Game State (Travel Complete): ", completedGameState);
        return completedGameState;
      });

      // Optionally save the game state after traveling
      // saveGameToServer(); // Uncomment this if save function is available
    }, location.travelTime * 1000); // Use location's configurable travel time in seconds
  };

  return (
    <div className={styles.worldMapContainer}>
      <button onClick={toggleMap} className={styles.mapButton}>
        <img src={mapIcon} alt="Map" className={styles.mapIcon} />
      </button>

      {/* Display Current Location */}
      <p className={styles.currentLocation}>Currently at: {gameState.currentLocation}</p>

      {/* Display Time Remaining if Traveling */}
      {gameState.travel && gameState.travel.isTraveling && timeRemaining !== null && (
        <p className={styles.timeRemaining}>Time until arrival: {timeRemaining} seconds</p>
      )}

      {isMapOpen && (
        <div className={styles.mapModal}>
          <img src={worldMapImage} alt="World Map" className={styles.mapImage} />
          <div className={styles.locationsContainer}>
            {worldLocations.map((location) => (
              <div key={location.id}>
                {/* Location Marker */}
                <div
                  className={styles.locationMarker}
                  style={{
                    top: location.coordinates.top,
                    left: location.coordinates.left,
                    backgroundImage: `url(${
                      gameState.currentLocation === location.id
                        ? markerUnavailable
                        : markerAvailable
                    })`,
                  }}
                  onClick={() => promptTravelToLocation(location)}
                />
              </div>
            ))}
          </div>
          <button onClick={toggleMap} className={styles.closeButton}>Close Map</button>
        </div>
      )}
    </div>
  );
}

export default WorldMap;
