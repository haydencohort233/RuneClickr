// shopRoutes.js
const express = require('express');
const db = require('../db/database'); // Import the centralized db connection
const router = express.Router();

// Endpoint to get shop by ID
router.get('/shops/:id', (req, res) => {
    console.log(`Fetching shop with ID: ${req.params.id}`);
    const shopId = req.params.id;
  
    const query = `SELECT * FROM shops WHERE id = ?`;
    db.get(query, [shopId], (err, row) => {
      if (err) {
        console.error('Error fetching shop:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      if (!row) {
        return res.status(404).json({ error: 'Shop not found' });
      }
  
      res.json(row);
    });
  });

// Fetch shop stock, including restock logic
router.get('/shops/:shopId/stock', (req, res) => {
    const shopId = req.params.shopId;
  
    const query = `
      SELECT id, item_name, quantity, restock_time, last_purchased, price, item_image
      FROM shops_stock
      WHERE shop_id = ?
    `;
  
    db.all(query, [shopId], (err, rows) => {
      if (err) {
        console.error('Error fetching shop stock:', err);
        return res.status(500).json({ message: 'Failed to fetch shop stock.' });
      }
  
      // Calculate restock for each item
      const currentTime = new Date().getTime();
      rows.forEach((item) => {
        if (item.restock_time > 0 && item.last_purchased) {
          const timeElapsed = (currentTime - new Date(item.last_purchased).getTime()) / (60 * 1000); // in minutes
          if (timeElapsed >= item.restock_time) {
            item.quantity += 1; // Restock by 1 unit, you can adjust as needed
            item.last_purchased = null; // Reset last purchased time to avoid continuous restocking
  
            // Update the database
            const updateQuery = `
              UPDATE shops_stock
              SET quantity = ?, last_purchased = ?
              WHERE id = ?
            `;
            db.run(updateQuery, [item.quantity, null, item.id], (updateErr) => {
              if (updateErr) {
                console.error('Error updating shop stock:', updateErr);
              }
            });
          }
        }
      });
  
      res.json(rows);
    });
  });
  
  // Purchase item route
  router.post('/shops/:shopId/stock/:itemId/buy', (req, res) => {
    const { shopId, itemId } = req.params;
  
    const selectQuery = `
      SELECT quantity, restock_time
      FROM shops_stock
      WHERE shop_id = ? AND id = ?
    `;
  
    db.get(selectQuery, [shopId, itemId], (err, item) => {
      if (err) {
        console.error('Error fetching item data:', err);
        return res.status(500).json({ message: 'Failed to fetch item data.' });
      }
  
      if (!item || item.quantity <= 0) {
        return res.status(400).json({ message: 'Item out of stock.' });
      }
  
      // Update item quantity and last purchased time
      const newQuantity = item.quantity - 1;
      const lastPurchased = new Date().toISOString();
  
      const updateQuery = `
        UPDATE shops_stock
        SET quantity = ?, last_purchased = ?
        WHERE shop_id = ? AND id = ?
      `;
      db.run(updateQuery, [newQuantity, lastPurchased, shopId, itemId], function (updateErr) {
        if (updateErr) {
          console.error('Error updating item quantity:', updateErr);
          return res.status(500).json({ message: 'Failed to update item quantity.' });
        }
        res.json({ message: 'Item purchased successfully.' });
      });
    });
  });

module.exports = router;
