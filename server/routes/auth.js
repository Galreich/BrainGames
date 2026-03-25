const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'שם משתמש וסיסמה נדרשים' });
  }

  if (username.length < 2 || username.length > 50) {
    return res.status(400).json({ error: 'שם משתמש חייב להיות בין 2 ל-50 תווים' });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: 'סיסמה חייבת להיות לפחות 4 תווים' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'שם המשתמש כבר קיים' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, passwordHash]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { userId: user.id, username: user.username, isAdmin: false },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'נרשמת בהצלחה!',
      token,
      user: { id: user.id, username: user.username, isAdmin: false, red_stars: 0, blue_stars: 0, green_stars: 0 },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'שגיאה בהרשמה, נסה שוב' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'שם משתמש וסיסמה נדרשים' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'שם משתמש או סיסמה שגויים' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'שם משתמש או סיסמה שגויים' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, isAdmin: user.is_admin === true },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'התחברת בהצלחה!',
      token,
      user: { id: user.id, username: user.username, isAdmin: user.is_admin === true, red_stars: user.red_stars || 0, blue_stars: user.blue_stars || 0, green_stars: user.green_stars || 0 },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'שגיאה בהתחברות, נסה שוב' });
  }
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'נדרשת התחברות' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'טוקן לא תקין' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.isAdmin !== true) {
    return res.status(403).json({ error: 'גישה לאדמינים בלבד' });
  }
  next();
};

// GET /api/auth/me — fresh user data from DB
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, username, is_admin, red_stars, blue_stars, green_stars FROM users WHERE id = $1',
      [req.user.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'משתמש לא נמצא' });
    const u = rows[0];
    res.json({ id: u.id, username: u.username, isAdmin: u.is_admin === true, red_stars: u.red_stars || 0, blue_stars: u.blue_stars || 0, green_stars: u.green_stars || 0 });
  } catch {
    res.status(500).json({ error: 'שגיאה' });
  }
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;
module.exports.requireAdmin = requireAdmin;
