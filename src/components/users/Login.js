// /src/components/users/Login.js
import React, { useState } from 'react';

function Login({ setUserId }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistered, setIsRegistered] = useState(true); // Toggles between login and register

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
        console.log('Login successful');
      } else {
        alert('Login failed: Invalid credentials');
        console.error('Login failed');
      }
    } catch (error) {
      alert('Failed to log in. Please try again later.');
      console.error('Failed to log in:', error);
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
        console.log('Registration successful');
        setIsRegistered(true);
      } else if (response.status === 409) {
        alert('Username already exists. Please choose a different username.');
      } else {
        alert('Registration failed. Please try again.');
        console.error('Registration failed');
      }
    } catch (error) {
      alert('Failed to register. Please try again later.');
      console.error('Failed to register:', error);
    }
  };

  return (
    <div className="login-container">
      <h2>{isRegistered ? "Login" : "Register"}</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={isRegistered ? handleLogin : handleRegister}>
        {isRegistered ? "Login" : "Register"}
      </button>
      <button onClick={() => setIsRegistered(!isRegistered)}>
        {isRegistered ? "Need to register?" : "Already have an account?"}
      </button>
    </div>
  );
}

export default Login;
