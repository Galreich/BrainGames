import express, { Request, Response } from 'express';
import { pool } from '../db';
import { authenticateToken, requireAdmin } from './auth';

const router = express.Router();

interface AdminSuggestionRow {
  id: number;
  username: string;
  subject: string | null;
  title: string;
  description: string;
  image_data: string | null;
  created_at: Date;
}

// GET /api/admin/suggestions — all suggestions, admin only
router.get(
  '/suggestions',
  authenticateToken,
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const result = await pool.query<AdminSuggestionRow>(
        `SELECT s.id, u.username, s.subject, s.title, s.description, s.image_data, s.created_at
       FROM suggestions s
       JOIN users u ON u.id = s.user_id
       ORDER BY s.created_at DESC`,
      );
      res.json({ suggestions: result.rows });
    } catch (err) {
      console.error('Admin get suggestions error:', err);
      res.status(500).json({ error: 'Error_loading_suggestions' });
    }
  },
);

export default router;
