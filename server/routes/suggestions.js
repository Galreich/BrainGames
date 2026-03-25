const express = require('express');
const { pool } = require('../db');
const { authenticateToken } = require('./auth');

const router = express.Router();

// POST /api/suggestions - submit a new suggestion (requires auth)
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, subject, imageData } = req.body;
  const { userId, username } = req.user;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'כותרת ההצעה נדרשת' });
  }
  if (!description || !description.trim()) {
    return res.status(400).json({ error: 'תיאור ההצעה נדרש' });
  }
  if (title.trim().length > 100) {
    return res.status(400).json({ error: 'הכותרת ארוכה מדי (מקסימום 100 תווים)' });
  }
  if (description.trim().length > 1000) {
    return res.status(400).json({ error: 'התיאור ארוך מדי (מקסימום 1000 תווים)' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO suggestions (user_id, username, title, description, subject, image_data)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, created_at`,
      [userId, username, title.trim(), description.trim(), subject || null, imageData || null]
    );

    res.status(201).json({
      message: 'ההצעה נשלחה בהצלחה! תודה רבה 🙏',
      suggestion: result.rows[0],
    });
  } catch (err) {
    console.error('Suggestion error:', err);
    res.status(500).json({ error: 'שגיאה בשליחת ההצעה, נסה שוב' });
  }
});

// GET /api/suggestions - list all suggestions (requires auth, admin-like)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, title, description, subject, created_at
       FROM suggestions ORDER BY created_at DESC LIMIT 50`
    );
    res.json({ suggestions: result.rows });
  } catch (err) {
    console.error('Get suggestions error:', err);
    res.status(500).json({ error: 'שגיאה בטעינת ההצעות' });
  }
});

module.exports = router;
