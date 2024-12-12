import React, { useState } from 'react';
import styles from './Login.module.css';

function Login({ setUserId }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistered, setIsRegistered] = useState(true);

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserId(data.userId);
        alert('Login successful');
      } else {
        alert('Login failed: Invalid credentials');
      }
    } catch (error) {
      alert('Failed to log in. Please try again later.');
    }
  };

  const handleRegister = async () => {
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
        alert('Username already exists. Please choose a different username.');
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (error) {
      alert('Failed to register. Please try again later.');
    }
  };

  return (
    <div className={styles["login-container"]}>
      <h2 className={styles["login-header"]}>
        {isRegistered ? "Login to RuneClicker" : "Welcome to RuneClicker"}
      </h2>
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
        onClick={isRegistered ? handleLogin : handleRegister}
        className={styles["login-button"]}
      >
        {isRegistered ? "Login" : "Register"}
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
