import express from 'express';
import { pool } from '../db';
import { authenticateToken } from './auth';

const router = express.Router();

// POST /api/game-records — save a game result and refresh total_stars
router.post('/', authenticateToken, async (req, res) => {
  const { game, subject, stars, score } = req.body;
  const { userId, username } = req.user;

  if (!game || !subject || stars === undefined) {
    return res.status(400).json({ error: 'Missing_game_records_fields' });
  }
  if (!['math', 'hebrew', 'english'].includes(subject)) {
    return res.status(400).json({ error: 'Invalid_subject' });
  }
  if (typeof stars !== 'number' || stars < 0 || stars > 3) {
    return res.status(400).json({ error: 'Invalid_stars' });
  }

  try {
    // Insert record
    await pool.query(
      `INSERT INTO game_records (user_id, username, game, subject, stars, score)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, username, game, subject, stars, score ?? null]
    );

    // Recalculate per-subject stars for user
    const colMap = { math: 'red_stars', hebrew: 'blue_stars', english: 'green_stars' };
    const col = colMap[subject];
    await pool.query(
      `UPDATE users SET ${col} = (
         SELECT COALESCE(SUM(stars), 0) FROM game_records WHERE user_id = $1 AND subject = $2
       ) WHERE id = $1`,
      [userId, subject]
    );

    // Return updated star counts
    const { rows } = await pool.query(
      `SELECT red_stars, blue_stars, green_stars FROM users WHERE id = $1`,
      [userId]
    );

    res.status(201).json({
      message: 'Record_saved',
      red_stars: rows[0].red_stars,
      blue_stars: rows[0].blue_stars,
      green_stars: rows[0].green_stars,
    });
  } catch (err) {
    console.error('Game record error:', err);
    res.status(500).json({ error: 'Error_saving_record' });
  }
});

// GET /api/game-records/summary — per-subject stars & count for logged-in user
router.get('/summary', authenticateToken, async (req, res) => {
  const { userId } = req.user;
  const { rows } = await pool.query(
    `SELECT subject,
            COALESCE(SUM(stars), 0)::int AS stars,
            COUNT(*)::int AS games_played
     FROM game_records
     WHERE user_id = $1
     GROUP BY subject`,
    [userId]
  );
  const summary = { math: { stars: 0, games_played: 0 }, hebrew: { stars: 0, games_played: 0 }, english: { stars: 0, games_played: 0 } };
  rows.forEach(r => { summary[r.subject] = { stars: r.stars, games_played: r.games_played }; });
  res.json(summary);
});

export default router;
