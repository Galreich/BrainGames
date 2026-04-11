import express from 'express';
import { pool } from '../db.js';
import { authenticateToken, requireAdmin } from './auth.js';

const router = express.Router();

// GET /api/admin/suggestions — all suggestions, admin only
router.get('/suggestions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.id, u.username, s.subject, s.title, s.description, s.image_data, s.created_at
       FROM suggestions s
       JOIN users u ON u.id = s.user_id
       ORDER BY s.created_at DESC`
    );
    res.json({ suggestions: result.rows });
  } catch (err) {
    console.error('Admin get suggestions error:', err);
    res.status(500).json({ error: 'שגיאה בטעינת ההצעות' });
  }
});

export default router;
