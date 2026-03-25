const express = require('express');
const { pool } = require('../db');
const { authenticateToken, requireAdmin } = require('./auth');

const router = express.Router();

// GET /api/admin/suggestions — all suggestions, admin only
router.get('/suggestions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, subject, title, description, image_data, created_at
       FROM suggestions
       ORDER BY created_at DESC`
    );
    res.json({ suggestions: result.rows });
  } catch (err) {
    console.error('Admin get suggestions error:', err);
    res.status(500).json({ error: 'שגיאה בטעינת ההצעות' });
  }
});

module.exports = router;
