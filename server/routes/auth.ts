import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import type { AuthUser } from '../types/express';

const router = express.Router();

interface UserIdRow {
  id: number;
}
interface NewUserRow {
  id: number;
  username: string;
  created_at: Date;
}
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
  const { username, password } = req.body as {
    username: string;
    password: string;
  };

  if (!username || !password) {
    return res.status(400).json({ error: 'Username_and_password_required' });
  }
  if (username.length < 2 || username.length > 50) {
    return res.status(400).json({ error: 'Username_length_error' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password_min_length' });
  }
  if (!/[a-zA-Zא-ת]/.test(password) || !/[0-9]/.test(password)) {
    return res.status(400).json({ error: 'Password_requirements' });
  }

  try {
    const existing = await pool.query<UserIdRow>(
      'SELECT id FROM users WHERE username = $1',
      [username],
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Username_exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query<NewUserRow>(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, passwordHash],
    );

    const user = result.rows[0];
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        is_admin: false,
      } satisfies AuthUser,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' },
    );

    res.status(201).json({
      message: 'Register_success',
      token,
      user: {
        id: user.id,
        username: user.username,
        is_admin: false,
        red_stars: 0,
        blue_stars: 0,
        green_stars: 0,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Register_error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body as {
    username: string;
    password: string;
  };

  if (!username || !password) {
    return res.status(400).json({ error: 'Username_and_password_required' });
  }

  try {
    const result = await pool.query<FullUserRow>(
      'SELECT * FROM users WHERE username = $1',
      [username],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid_credentials' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid_credentials' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        is_admin: user.is_admin === true,
      } satisfies AuthUser,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' },
    );

    res.json({
      message: 'Login_success',
      token,
      user: {
        id: user.id,
        username: user.username,
        is_admin: user.is_admin === true,
        red_stars: user.red_stars || 0,
        blue_stars: user.blue_stars || 0,
        green_stars: user.green_stars || 0,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login_error' });
  }
});

// Middleware to verify JWT
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Login_required' });
    return;
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || 'fallback_secret',
    (err, decoded) => {
      if (err) {
        res.status(403).json({ error: 'Invalid_token' });
        return;
      }
      req.user = decoded as AuthUser;
      next();
    },
  );
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user || req.user.is_admin !== true) {
    res.status(403).json({ error: 'Admin_only' });
    return;
  }
  next();
};

// GET /api/auth/me — fresh user data from DB
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query<MeRow>(
      'SELECT id, username, is_admin, red_stars, blue_stars, green_stars FROM users WHERE id = $1',
      [req.user!.userId],
    );
    if (!rows.length) return res.status(404).json({ error: 'User_not_found' });
    const u = rows[0];
    res.json({
      id: u.id,
      username: u.username,
      is_admin: u.is_admin === true,
      red_stars: u.red_stars || 0,
      blue_stars: u.blue_stars || 0,
      green_stars: u.green_stars || 0,
    });
  } catch {
    res.status(500).json({ error: 'General_error' });
  }
});

export default router;
