import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// GET /api/progress/:userId — derived from game_records
router.get('/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  if (parseInt(userId) !== req.user.userId) {
    return res.status(403).json({ error: 'אין הרשאה לצפות בנתונים אלו' });
  }

  try {
    const result = await pool.query(
      `SELECT subject,
              COALESCE(SUM(stars), 0)  AS stars,
              COUNT(*)                 AS games_played,
              MAX(played_at)           AS updated_at
       FROM game_records
       WHERE user_id = $1
       GROUP BY subject`,
      [userId]
    );

    const progress = {};
    result.rows.forEach((row) => {
      progress[row.subject] = {
        stars: parseInt(row.stars),
        gamesPlayed: parseInt(row.games_played),
        updatedAt: row.updated_at,
      };
    });

    ['math', 'hebrew', 'english'].forEach((subject) => {
      if (!progress[subject]) {
        progress[subject] = { stars: 0, gamesPlayed: 0, updatedAt: null };
      }
    });

    res.json({ progress });
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ error: 'שגיאה בטעינת ההתקדמות' });
  }
});

export default router;
