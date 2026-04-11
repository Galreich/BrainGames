import express from 'express';
import { pool } from '../db';
import { authenticateToken } from './auth';

const router = express.Router();

// POST /api/suggestions - submit a new suggestion (requires auth)
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, subject, imageData } = req.body;
  const { userId, username } = req.user;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Suggestion_title_required' });
  }
  if (!description || !description.trim()) {
    return res.status(400).json({ error: 'Suggestion_description_required' });
  }
  if (title.trim().length > 100) {
    return res.status(400).json({ error: 'Suggestion_title_too_long' });
  }
  if (description.trim().length > 1000) {
    return res.status(400).json({ error: 'Suggestion_description_too_long' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO suggestions (user_id, username, title, description, subject, image_data)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, created_at`,
      [
        userId,
        username,
        title.trim(),
        description.trim(),
        subject || null,
        imageData || null,
      ],
    );

    res.status(201).json({
      message: 'Suggestion_success_message',
      suggestion: result.rows[0],
    });
  } catch (err) {
    console.error('Suggestion error:', err);
    res.status(500).json({ error: 'Suggestion_error' });
  }
});

// GET /api/suggestions - list all suggestions (requires auth, admin-like)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, title, description, subject, created_at
       FROM suggestions ORDER BY created_at DESC LIMIT 50`,
    );
    res.json({ suggestions: result.rows });
  } catch (err) {
    console.error('Get suggestions error:', err);
    res.status(500).json({ error: 'Error_loading_suggestions_server' });
  }
});

export default router;
