// playerRoutes.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to SQLite database file
const dbPath = path.resolve(__dirname, '../db/idleGameData.sqlite');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Route to get player details by user ID
router.get('/player/:userId', (req, res) => {
  const userId = req.params.userId;
  console.log(`[GET] /player/:userId - Fetching player details for userId: ${userId}`); // Logging userId
  const query = `SELECT username, currency, hp, maxHP, inventory, bank, maxInventorySpace FROM players WHERE user_id = ?`;

  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error('Error retrieving player data:', err);
      return res.status(500).json({ message: 'Failed to retrieve player data.' });
    }
    if (!row) {
      console.warn(`[GET] /player/:userId - Player not found for userId: ${userId}`); // Logging missing player
      return res.status(404).json({ message: 'Player not found' });
    }
    console.log(`[GET] /player/:userId - Player data retrieved successfully:`, row); // Add this log to see what data is coming back
    res.json(row);
  });  
});

// Route to update player HP
router.post('/player/:userId/update-hp', (req, res) => {
  const userId = req.params.userId;
  const { hp } = req.body;
  console.log(`[POST] /player/:userId/update-hp - Updating HP for userId: ${userId} to ${hp}`); // Logging update
  const query = `UPDATE players SET hp = ? WHERE user_id = ?`;

  db.run(query, [hp, userId], function (err) {
    if (err) {
      console.error('Error updating player HP:', err);
      return res.status(500).json({ message: 'Failed to update player HP.' });
    }
    console.log(`[POST] /player/:userId/update-hp - HP updated successfully for userId: ${userId}`); // Logging success
    res.json({ message: 'Player HP updated successfully.' });
  });
});

// Route to update player currency
router.post('/player/:userId/update-currency', (req, res) => {
  const userId = req.params.userId;
  const { currency } = req.body;
  console.log(`[POST] /player/:userId/update-currency - Updating currency for userId: ${userId} to ${currency}`); // Logging update
  const query = `UPDATE players SET currency = ? WHERE user_id = ?`;

  db.run(query, [currency, userId], function (err) {
    if (err) {
      console.error('Error updating player currency:', err);
      return res.status(500).json({ message: 'Failed to update player currency.' });
    }
    console.log(`[POST] /player/:userId/update-currency - Currency updated successfully for userId: ${userId}`); // Logging success
    res.json({ message: 'Player currency updated successfully.' });
  });
});

// Route to add an item to player's inventory
router.post('/player/:userId/add-item', (req, res) => {
  const userId = req.params.userId;
  const { item } = req.body;
  console.log(`[POST] /player/:userId/add-item - Adding item to inventory for userId: ${userId}`, item); // Logging item addition
  const query = `SELECT inventory, maxInventorySpace FROM players WHERE user_id = ?`;

  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error('Error retrieving player inventory:', err);
      return res.status(500).json({ message: 'Failed to retrieve player inventory.' });
    }
    if (!row) {
      console.warn(`[POST] /player/:userId/add-item - Player not found for userId: ${userId}`); // Logging missing player
      return res.status(404).json({ message: 'Player not found' });
    }
    const inventory = JSON.parse(row.inventory);
    if (inventory.length >= row.maxInventorySpace) {
      console.warn(`[POST] /player/:userId/add-item - Inventory full for userId: ${userId}`); // Logging full inventory
      return res.status(400).json({ message: 'Inventory is full.' });
    }
    inventory.push(item);
    const updateQuery = `UPDATE players SET inventory = ? WHERE user_id = ?`;
    db.run(updateQuery, [JSON.stringify(inventory), userId], function (err) {
      if (err) {
        console.error('Error updating player inventory:', err);
        return res.status(500).json({ message: 'Failed to update player inventory.' });
      }
      console.log(`[POST] /player/:userId/add-item - Item added to inventory successfully for userId: ${userId}`); // Logging success
      res.json({ message: 'Item added to inventory successfully.' });
    });
  });
});

// Route to move an item from inventory to bank
router.post('/player/:userId/move-to-bank', (req, res) => {
  const userId = req.params.userId;
  const { itemIndex } = req.body;
  console.log(`[POST] /player/:userId/move-to-bank - Moving item at index ${itemIndex} from inventory to bank for userId: ${userId}`); // Logging move action
  const query = `SELECT inventory, bank FROM players WHERE user_id = ?`;

  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error('Error retrieving player data:', err);
      return res.status(500).json({ message: 'Failed to retrieve player data.' });
    }
    if (!row) {
      console.warn(`[POST] /player/:userId/move-to-bank - Player not found for userId: ${userId}`); // Logging missing player
      return res.status(404).json({ message: 'Player not found' });
    }
    const inventory = JSON.parse(row.inventory);
    const bank = JSON.parse(row.bank);
    if (itemIndex < 0 || itemIndex >= inventory.length) {
      console.warn(`[POST] /player/:userId/move-to-bank - Invalid item index for userId: ${userId}, index: ${itemIndex}`); // Logging invalid index
      return res.status(400).json({ message: 'Invalid item index.' });
    }
    const item = inventory.splice(itemIndex, 1)[0];
    bank.push(item);
    const updateQuery = `UPDATE players SET inventory = ?, bank = ? WHERE user_id = ?`;
    db.run(updateQuery, [JSON.stringify(inventory), JSON.stringify(bank), userId], function (err) {
      if (err) {
        console.error('Error updating player data:', err);
        return res.status(500).json({ message: 'Failed to update player data.' });
      }
      console.log(`[POST] /player/:userId/move-to-bank - Item moved to bank successfully for userId: ${userId}`); // Logging success
      res.json({ message: 'Item moved to bank successfully.' });
    });
  });
});

// Route to move an item from bank to inventory
router.post('/player/:userId/move-to-inventory', (req, res) => {
  const userId = req.params.userId;
  const { itemIndex } = req.body;
  console.log(`[POST] /player/:userId/move-to-inventory - Moving item at index ${itemIndex} from bank to inventory for userId: ${userId}`); // Logging move action
  const query = `SELECT inventory, bank, maxInventorySpace FROM players WHERE user_id = ?`;

  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error('Error retrieving player data:', err);
      return res.status(500).json({ message: 'Failed to retrieve player data.' });
    }
    if (!row) {
      console.warn(`[POST] /player/:userId/move-to-inventory - Player not found for userId: ${userId}`); // Logging missing player
      return res.status(404).json({ message: 'Player not found' });
    }
    const inventory = JSON.parse(row.inventory);
    const bank = JSON.parse(row.bank);
    if (inventory.length >= row.maxInventorySpace) {
      console.warn(`[POST] /player/:userId/move-to-inventory - Inventory full for userId: ${userId}`); // Logging full inventory
      return res.status(400).json({ message: 'Inventory is full.' });
    }
    if (itemIndex < 0 || itemIndex >= bank.length) {
      console.warn(`[POST] /player/:userId/move-to-inventory - Invalid item index for userId: ${userId}, index: ${itemIndex}`); // Logging invalid index
      return res.status(400).json({ message: 'Invalid item index.' });
    }
    const item = bank.splice(itemIndex, 1)[0];
    inventory.push(item);
    const updateQuery = `UPDATE players SET inventory = ?, bank = ? WHERE user_id = ?`;
    db.run(updateQuery, [JSON.stringify(inventory), JSON.stringify(bank), userId], function (err) {
      if (err) {
        console.error('Error updating player data:', err);
        return res.status(500).json({ message: 'Failed to update player data.' });
      }
      console.log(`[POST] /player/:userId/move-to-inventory - Item moved to inventory successfully for userId: ${userId}`); // Logging success
      res.json({ message: 'Item moved to inventory successfully.' });
    });
  });
});

// Route to save game state including updating currency in players table
router.post('/player/:userId/save-game', (req, res) => {
  const userId = req.params.userId;
  const { gameState } = req.body;
  const { currency } = gameState;

  console.log(`[POST] /player/:userId/save-game - Saving game state for userId: ${userId}`); // Logging save action
  const saveGameQuery = `INSERT INTO gamesaves (user_id, game_state, saved_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id)
    DO UPDATE SET game_state = excluded.game_state, saved_at = CURRENT_TIMESTAMP`;

  db.run(saveGameQuery, [userId, JSON.stringify(gameState)], function (err) {
    if (err) {
      console.error('Error saving game state:', err);
      return res.status(500).json({ message: 'Failed to save game state.' });
    }

    console.log(`[POST] /player/:userId/save-game - Game state saved for userId: ${userId}`); // Logging game save success
    const updateCurrencyQuery = `UPDATE players SET currency = ? WHERE user_id = ?`;
    db.run(updateCurrencyQuery, [currency, userId], function (err) {
      if (err) {
        console.error('Error updating player currency:', err);
        return res.status(500).json({ message: 'Failed to update player currency.' });
      }
      console.log(`[POST] /player/:userId/save-game - Currency updated successfully in players table for userId: ${userId}`); // Logging currency update success
      res.json({ message: 'Game state saved successfully.' });
    });
  });
});

module.exports = router;
