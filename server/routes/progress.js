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
      `SELECT g.name,
              COALESCE(SUM(gr.stars), 0) AS stars,
              COUNT(*)                   AS games_played,
              MAX(gr.played_at)          AS updated_at
       FROM game_records gr
       JOIN games g ON g.id = gr.game_id
       WHERE gr.user_id = $1
       GROUP BY g.name`,
      [userId]
    );

    const progress = {};
    result.rows.forEach((row) => {
      progress[row.name] = {
        stars: parseInt(row.stars),
        gamesPlayed: parseInt(row.games_played),
        updatedAt: row.updated_at,
      };
    });

    ['math-puzzle', 'hebrew-wordle', 'english-wordle'].forEach((name) => {
      if (!progress[name]) {
        progress[name] = { stars: 0, gamesPlayed: 0, updatedAt: null };
      }
    });

    res.json({ progress });
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ error: 'שגיאה בטעינת ההתקדמות' });
  }
});

export default router;
