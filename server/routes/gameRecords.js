import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

const colMap = {
  'math-puzzle': 'red_stars',
  'hebrew-wordle': 'blue_stars',
  'english-wordle': 'green_stars',
};

// POST /api/game-records — save a game result and refresh star counts
router.post('/', authenticateToken, async (req, res) => {
  const { game, stars, score } = req.body;
  const { userId } = req.user;

  if (!game || stars === undefined) {
    return res.status(400).json({ error: 'game ו-stars נדרשים' });
  }
  if (!colMap[game]) {
    return res.status(400).json({ error: 'game לא תקין' });
  }
  if (typeof stars !== 'number' || stars < 0 || stars > 3) {
    return res.status(400).json({ error: 'stars חייב להיות בין 0 ל-3' });
  }

  try {
    // Look up game_id
    const gameRow = await pool.query('SELECT id FROM games WHERE name = $1', [game]);
    if (gameRow.rows.length === 0) {
      return res.status(404).json({ error: 'משחק לא נמצא' });
    }
    const gameId = gameRow.rows[0].id;

    // Insert record
    await pool.query(
      `INSERT INTO game_records (user_id, game_id, stars, score)
       VALUES ($1, $2, $3, $4)`,
      [userId, gameId, stars, score ?? null]
    );

    // Recalculate stars for this game in the user row
    const col = colMap[game];
    await pool.query(
      `UPDATE users SET ${col} = (
         SELECT COALESCE(SUM(gr.stars), 0)
         FROM game_records gr
         WHERE gr.user_id = $1 AND gr.game_id = $2
       ) WHERE id = $1`,
      [userId, gameId]
    );

    // Return updated star counts
    const { rows } = await pool.query(
      `SELECT red_stars, blue_stars, green_stars FROM users WHERE id = $1`,
      [userId]
    );

    res.status(201).json({
      message: 'תוצאה נשמרה',
      red_stars: rows[0].red_stars,
      blue_stars: rows[0].blue_stars,
      green_stars: rows[0].green_stars,
    });
  } catch (err) {
    console.error('Game record error:', err);
    res.status(500).json({ error: 'שגיאה בשמירת התוצאה' });
  }
});

// GET /api/game-records/summary — per-game stars & count for logged-in user
router.get('/summary', authenticateToken, async (req, res) => {
  const { userId } = req.user;
  const { rows } = await pool.query(
    `SELECT g.name,
            COALESCE(SUM(gr.stars), 0)::int AS stars,
            COUNT(*)::int AS games_played
     FROM game_records gr
     JOIN games g ON g.id = gr.game_id
     WHERE gr.user_id = $1
     GROUP BY g.name`,
    [userId]
  );
  const summary = {
    'math-puzzle': { stars: 0, games_played: 0 },
    'hebrew-wordle': { stars: 0, games_played: 0 },
    'english-wordle': { stars: 0, games_played: 0 },
  };
  rows.forEach(r => { summary[r.name] = { stars: r.stars, games_played: r.games_played }; });
  res.json(summary);
});

export default router;
