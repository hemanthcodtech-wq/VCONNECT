const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all stores
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stores ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new store
router.post('/', async (req, res) => {
  try {
    const { name, owner_name, email, phone, address, certificate_url } = req.body;
    if (!name) return res.status(400).json({ error: 'Store name is required' });
    
    const result = await pool.query(
      'INSERT INTO stores (name, owner_name, email, phone, address, certificate_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, owner_name || null, email || null, phone || null, address || '', certificate_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a store
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM stores WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Store not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
