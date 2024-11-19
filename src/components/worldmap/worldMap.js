import React, { useState, useEffect, useRef } from 'react';
import styles from './worldMap.module.css';
import worldLocations from './worldLocations.json';
import worldMapImage from '../../assets/images/worldmap/worldmap.png';
import markerAvailable from '../../assets/images/worldmap/icons/marker_available.png';
import markerUnavailable from '../../assets/images/worldmap/icons/marker_unavailable.gif';

function WorldMap({ gameState, setGameState, onClose }) {
  const mapRef = useRef(null);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mapRef.current && !mapRef.current.contains(event.target) && typeof onClose === 'function') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

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
    <div className={styles.worldMapOverlay} ref={mapRef} onClick={(e) => {
      if (e.target === e.currentTarget && typeof onClose === 'function') {
        onClose();
      }
    }}>
      <div className={styles.worldMapContainer}>
        <div className={styles.mapModal}>
          {/* Display Current Location */}
          <p className={styles.currentLocation}>Currently at: {gameState.currentLocation}</p>

          {/* Display Time Remaining if Traveling */}
          {gameState.travel && gameState.travel.isTraveling && timeRemaining !== null && (
            <p className={styles.timeRemaining}>Time until arrival: {timeRemaining} seconds</p>
          )}

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
          <button onClick={onClose} className={styles.closeButton}>Close Map</button>
        </div>
      </div>
    </div>
  );
}

export default WorldMap;
