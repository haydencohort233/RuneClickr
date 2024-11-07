// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const dbPath = path.resolve(__dirname, './db/idleGameData.sqlite');
console.log('Database Path:', dbPath); // Log the database path
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database.');
  }
});

db.serialize(); // Serialize to avoid concurrent write access issues

const app = express();
const port = 5000;

// Setup CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Route to register a new user
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const checkUserQuery = `SELECT * FROM users WHERE username = ?`;
  db.get(checkUserQuery, [username], (err, row) => {
    if (err) {
      console.error('Error checking for existing user:', err);
      return res.status(500).json({ message: 'Failed to register user. Please try again later.' });
    }
    if (row) {
      return res.status(409).json({ message: 'Username already exists. Please choose a different username.' });
    }

    const query = `INSERT INTO users (username, password, last_active) VALUES (?, ?, ?)`;
    const lastActive = new Date().toISOString();

    db.run(query, [username, password, lastActive], function (err) {
      if (err) {
        console.error('Error registering user:', err);
        return res.status(500).json({ message: 'Failed to register user. Please try again.' });
      }
      res.json({ message: 'User registered successfully.' });
    });
  });
});

// Route to login a user
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
  db.get(query, [username, password], (err, row) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ message: 'Failed to log in. Please try again later.' });
    }
    if (row) {
      res.json({ userId: row.id, message: 'Login successful.' });
    } else {
      res.status(401).json({ message: 'Invalid credentials. Please try again.' });
    }
  });
});

// Route to get user details for export
app.get('/api/user-details/:userId', (req, res) => {
  const userId = req.params.userId;

  const query = `SELECT username, password, currentLocation, last_active, level, currency, experience, hitpoints, maxHitPoints, 
    inventory, maxInventorySpace, bank, maxBankSpace, travel_count FROM users WHERE id = ?`;
  db.get(query, [userId], (err, row) => {
    if (err) {
      if (err.code === 'SQLITE_BUSY') {
        console.error('Database is busy. Please try again.');
        return res.status(503).json({ message: 'Database is busy. Please try again later.' });
      }
      console.error('Error retrieving user details:', err);
      return res.status(500).json({ message: 'Failed to retrieve user details. Please try again later.' });
    }
    if (!row) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ username: row.username, password: row.password, currentLocation: row.currentLocation, currency: row.currency, 
      hitpoints: row.hitpoints, maxHitPoints: row.maxHitPoints, level: row.level, experience: row.experience,
      inventory: row.inventory, maxInventorySpace: row.maxHitPoints, bank: row.bank, maxBankSpace: row.maxBankSpace, 
      travel_count: row.travel_count, last_active: row.last_active });
  });
});

const retryDatabaseOperation = (query, params, retries, callback) => {
  db.run(query, params, function (err) {
    if (err && err.code === 'SQLITE_BUSY' && retries > 0) {
      console.error('Database is busy, retrying...');
      setTimeout(() => retryDatabaseOperation(query, params, retries - 1, callback), 100); // retry after 100 ms
    } else if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
};

// Update the save game route to use the retry function
app.post('/api/save-game', (req, res) => {
  const { userId, gameState } = req.body;
  if (!userId || !gameState) {
    return res.status(400).json({ message: 'Invalid request. User ID and game state are required.' });
  }

  const {
    currency,
    currentLocation,
    level,
    experience,
    hitpoints,
    maxHitPoints,
    inventory,
    maxInventorySpace,
    bank,
    maxBankSpace,
    travel_count
  } = gameState;

  const lastActive = new Date().toISOString();

  const updateUserQuery = `
    UPDATE users 
    SET currency = ?, currentLocation = ?, level = ?, experience = ?, 
        hitpoints = ?, maxHitPoints = ?, inventory = ?, travel_count = ?, 
        maxInventorySpace = ?, bank = ?, maxBankSpace = ?, last_active = ? 
    WHERE id = ?`;

    retryDatabaseOperation(
      updateUserQuery,
      [
        currency,              // matches "currency = ?"
        currentLocation,       // matches "currentLocation = ?"
        level,                 // matches "level = ?"
        experience,            // matches "experience = ?"
        hitpoints,             // matches "hitpoints = ?"
        maxHitPoints,          // matches "maxHitPoints = ?"
        JSON.stringify(inventory), // matches "inventory = ?"
        travel_count,          // matches "travel_count = ?"
        maxInventorySpace,     // matches "maxInventorySpace = ?"
        JSON.stringify(bank),  // matches "bank = ?"
        maxBankSpace,          // matches "maxBankSpace = ?"
        lastActive,            // matches "last_active = ?"
        userId                 // matches "WHERE id = ?"
      ],
      5,
    function (err) {
      if (err) {
        console.error('Error updating user data:', err);
        return res.status(500).json({ message: 'Failed to save user data. Please try again later.' });
      }

      const query = `
        INSERT INTO game_state (user_id, game_state) 
        VALUES (?, ?) 
        ON CONFLICT(user_id) DO UPDATE SET game_state = excluded.game_state`;

      retryDatabaseOperation(query, [userId, JSON.stringify(gameState)], 5, function (err) {
        if (err) {
          console.error('Error saving game state:', err);
          return res.status(500).json({ message: 'Failed to save game state. Please try again later.' });
        }
        res.json({ message: 'Game state saved successfully.' });
      });
    }
  );
});

// Route to load game state
app.get('/api/load-game/:userId', (req, res) => {
  const userId = req.params.userId;

  const userQuery = `SELECT currency, last_active, currentLocation, level, experience, travel_count,
    hitpoints, maxHitPoints, inventory, maxInventorySpace, bank, maxBankSpace FROM users WHERE id = ?`;
  db.get(userQuery, [userId], (err, userRow) => {
    if (err) {
      if (err.code === 'SQLITE_BUSY') {
        console.error('Database is busy. Please try again.');
        return res.status(503).json({ message: 'Database is busy. Please try again later.' });
      }
      console.error('Error loading user data:', err);
      return res.status(500).json({ message: 'Failed to load user data. Please try again later.' });
    }
    if (!userRow) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const gameStateQuery = `SELECT game_state FROM game_state WHERE user_id = ?`;
    db.get(gameStateQuery, [userId], (err, gameStateRow) => {
      if (err) {
        if (err.code === 'SQLITE_BUSY') {
          console.error('Database is busy. Please try again.');
          return res.status(503).json({ message: 'Database is busy. Please try again later.' });
        }
        console.error('Error loading game state:', err);
        return res.status(500).json({ message: 'Failed to load game state. Please try again later.' });
      }
      const gameState = gameStateRow ? JSON.parse(gameStateRow.game_state) : {};
      gameState.currency = userRow.currency;
      gameState.last_active = userRow.last_active;
      res.json({ gameState });
    });
  });
});

// Route to export game state as JSON
app.get('/api/export-game/:userId', (req, res) => {
  const userId = req.params.userId;

  const userQuery = `SELECT currency, last_active, currentLocation, level, experience, travel_count,
    hitpoints, maxHitPoints, inventory, maxInventorySpace, bank, maxBankSpace FROM users WHERE id = ?`;
  db.get(userQuery, [userId], (err, userRow) => {
    if (err) {
      if (err.code === 'SQLITE_BUSY') {
        console.error('Database is busy. Please try again.');
        return res.status(503).json({ message: 'Database is busy. Please try again later.' });
      }
      console.error('Error exporting user data:', err);
      return res.status(500).json({ message: 'Failed to export user data. Please try again later.' });
    }
    if (!userRow) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const gameStateQuery = `SELECT game_state FROM game_state WHERE user_id = ?`;
    db.get(gameStateQuery, [userId], (err, gameStateRow) => {
      if (err) {
        if (err.code === 'SQLITE_BUSY') {
          console.error('Database is busy. Please try again.');
          return res.status(503).json({ message: 'Database is busy. Please try again later.' });
        }
        console.error('Error exporting game state:', err);
        return res.status(500).json({ message: 'Failed to export game state. Please try again later.' });
      }
      const gameState = gameStateRow ? JSON.parse(gameStateRow.game_state) : {};
      gameState.currency = userRow.currency;
      gameState.last_active = userRow.last_active;
      res.setHeader('Content-Disposition', 'attachment; filename=gameState.json');
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(gameState, null, 2));
    });
  });
});

// Route to import game state from a JSON file
app.post('/api/import-game', (req, res) => {
  const { userId, gameState } = req.body;

  if (!userId || !gameState) {
    return res.status(400).json({ message: 'Invalid request. Please provide userId and gameState.' });
  }

  const { currency, last_active, ...restOfGameState } = gameState;
  const gameStateString = JSON.stringify(restOfGameState);

  const updateUserQuery = `UPDATE users SET currency = ?, currentLocation = ?, level = ?, experience = ?, travel_count = ?,
    hitpoints = ?, maxHitPoints = ?, inventory = ?, maxInventorySpace = ?, bank = ?, maxBankSpace = ?, last_active = ? WHERE id = ?`;
  db.run(updateUserQuery, [currency, last_active, userId], function (err) {
    if (err) {
      if (err.code === 'SQLITE_BUSY') {
        console.error('Database is busy. Please try again.');
        return res.status(503).json({ message: 'Database is busy. Please try again later.' });
      }
      console.error('Error updating user data during import:', err);
      return res.status(500).json({ message: 'Failed to import user data. Please try again later.' });
    }

    const query = `INSERT INTO game_state (user_id, game_state) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET game_state = excluded.game_state`;
    db.run(query, [userId, gameStateString], function (err) {
      if (err) {
        if (err.code === 'SQLITE_BUSY') {
          console.error('Database is busy. Please try again.');
          return res.status(503).json({ message: 'Database is busy. Please try again later.' });
        }
        console.error('Error importing game state:', err);
        return res.status(500).json({ message: 'Failed to import game state. Please try again later.' });
      }
      res.json({ message: 'Game state imported successfully.' });
    });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
