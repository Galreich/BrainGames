import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import type { AuthUser } from '../types/express.js';

const router = express.Router();

interface UserIdRow { id: number; }
interface NewUserRow { id: number; username: string; created_at: Date; }
interface FullUserRow {
  id: number;
  username: string;
  password_hash: string;
  is_admin: boolean;
  red_stars: number;
  blue_stars: number;
  green_stars: number;
}
interface MeRow {
  id: number;
  username: string;
  is_admin: boolean;
  red_stars: number;
  blue_stars: number;
  green_stars: number;
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { username, password } = req.body as { username: string; password: string };

  if (!username || !password) {
    return res.status(400).json({ error: 'שם משתמש וסיסמה נדרשים' });
  }

  if (username.length < 2 || username.length > 50) {
    return res.status(400).json({ error: 'שם משתמש חייב להיות בין 2 ל-50 תווים' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'סיסמה חייבת להיות לפחות 6 תווים' });
  }

  if (!/[a-zA-Zא-ת]/.test(password) || !/[0-9]/.test(password)) {
    return res.status(400).json({ error: 'סיסמה חייבת להכיל לפחות אות אחת ומספר אחד' });
  }

  try {
    const existing = await pool.query<UserIdRow>('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'שם המשתמש כבר קיים' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query<NewUserRow>(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, passwordHash]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { userId: user.id, username: user.username, isAdmin: false } satisfies AuthUser,
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
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body as { username: string; password: string };

  if (!username || !password) {
    return res.status(400).json({ error: 'שם משתמש וסיסמה נדרשים' });
  }

  try {
    const result = await pool.query<FullUserRow>('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'שם משתמש או סיסמה שגויים' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'שם משתמש או סיסמה שגויים' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, isAdmin: user.is_admin === true } satisfies AuthUser,
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
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'נדרשת התחברות' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, decoded) => {
    if (err) {
      res.status(403).json({ error: 'טוקן לא תקין' });
      return;
    }
    req.user = decoded as AuthUser;
    next();
  });
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.isAdmin !== true) {
    res.status(403).json({ error: 'גישה לאדמינים בלבד' });
    return;
  }
  next();
};

// GET /api/auth/me — fresh user data from DB
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query<MeRow>(
      'SELECT id, username, is_admin, red_stars, blue_stars, green_stars FROM users WHERE id = $1',
      [req.user!.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'משתמש לא נמצא' });
    const u = rows[0];
    res.json({ id: u.id, username: u.username, isAdmin: u.is_admin === true, red_stars: u.red_stars || 0, blue_stars: u.blue_stars || 0, green_stars: u.green_stars || 0 });
  } catch {
    res.status(500).json({ error: 'שגיאה' });
  }
});

export default router;
