import express, { Request, Response } from 'express';
import { pool } from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

interface SuggestionReturnRow { id: number; title: string; created_at: Date; }
interface SuggestionListRow {
  id: number;
  username: string;
  title: string;
  description: string;
  subject: string | null;
  created_at: Date;
}

// POST /api/suggestions - submit a new suggestion (requires auth)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  const { title, description, subject, imageData } = req.body as {
    title: string;
    description: string;
    subject?: string;
    imageData?: string;
  };
  const { userId } = req.user!;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'כותרת ההצעה נדרשת' });
  }
  if (!description || !description.trim()) {
    return res.status(400).json({ error: 'תיאור ההצעה נדרש' });
  }
  if (title.trim().length > 100) {
    return res.status(400).json({ error: 'הכותרת ארוכה מדי (מקסימום 100 תווים)' });
  }
  if (description.trim().length > 1000) {
    return res.status(400).json({ error: 'התיאור ארוך מדי (מקסימום 1000 תווים)' });
  }

  try {
    const result = await pool.query<SuggestionReturnRow>(
      `INSERT INTO suggestions (user_id, title, description, subject, image_data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, created_at`,
      [userId, title.trim(), description.trim(), subject || null, imageData || null]
    );

    res.status(201).json({
      message: 'ההצעה נשלחה בהצלחה! תודה רבה 🙏',
      suggestion: result.rows[0],
    });
  } catch (err) {
    console.error('Suggestion error:', err);
    res.status(500).json({ error: 'שגיאה בשליחת ההצעה, נסה שוב' });
  }
});

// GET /api/suggestions - list all suggestions (requires auth)
router.get('/', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query<SuggestionListRow>(
      `SELECT s.id, u.username, s.title, s.description, s.subject, s.created_at
       FROM suggestions s
       JOIN users u ON u.id = s.user_id
       ORDER BY s.created_at DESC LIMIT 50`
    );
    res.json({ suggestions: result.rows });
  } catch (err) {
    console.error('Get suggestions error:', err);
    res.status(500).json({ error: 'שגיאה בטעינת ההצעות' });
  }
});

export default router;
