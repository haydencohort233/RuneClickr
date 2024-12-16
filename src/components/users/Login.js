import React, { useState, useEffect } from 'react';
import styles from './Login.module.css';

function Login({ setUserId, setGameState }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistered, setIsRegistered] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMessage('Username and password are required.');
      return;
    }
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserId(data.userId);
        if (setGameState) {
          await loadGameFromServer(data.userId); // Automatically load the game after successful login
        } else {
          console.error('setGameState is not defined');
        }
      } else {
        setErrorMessage('Login failed: Invalid credentials');
      }
    } catch (error) {
      setErrorMessage('Failed to log in. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username || !password) {
      setErrorMessage('Username and password are required.');
      return;
    }
    if (isLoading) return;
    setIsLoading(true);
    try {
      const initialGameState = {
        currency: 0,
        buildings: {},
        achievements: {
          gain_100_currency: false,
        },
        last_active: new Date().toISOString(),
      };

      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, gameState: initialGameState }),
      });

      if (response.ok) {
        alert('Registration successful');
        setIsRegistered(true);
      } else if (response.status === 409) {
        setErrorMessage('Username already exists. Please choose a different username.');
      } else {
        setErrorMessage('Registration failed. Please try again.');
      }
    } catch (error) {
      setErrorMessage('Failed to register. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGameFromServer = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/load-game/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (setGameState) {
          setGameState((prevState) => ({
            ...prevState,
            ...data.gameState,
          }));
          console.log('Game state loaded successfully:', data.gameState);
        } else {
          console.error('setGameState is not defined');
        }
      } else {
        console.error('No saved game found.');
      }
    } catch (error) {
      console.error('Failed to load game from server:', error);
    }
  };

  return (
    <div className={styles["login-container"]}>
      <h2 className={styles["login-header"]}>
        {isRegistered ? "Login to RuneClicker" : "Welcome to RuneClicker"}
      </h2>
      {errorMessage && <p className={styles["error-message"]}>{errorMessage}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className={styles["login-input"]}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles["login-input"]}
      />
      <button
        disabled={isLoading}
        onClick={isRegistered ? handleLogin : handleRegister}
        className={styles["login-button"]}
      >
        {isLoading ? "Loading..." : isRegistered ? "Login" : "Register"}
      </button>
      <button
        onClick={() => setIsRegistered(!isRegistered)}
        className={styles["login-toggle-button"]}
      >
        {isRegistered ? "Need to register?" : "Returning user?"}
      </button>
    </div>
  );
}

export default Login;
