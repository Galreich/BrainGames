import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { initDB } from './db.js';

import authRoutes from './routes/auth.js';
import progressRoutes from './routes/progress.js';
import wordsRoutes from './routes/words.js';
import suggestionsRoutes from './routes/suggestions.js';
import gameRecordsRoutes from './routes/gameRecords.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/words', wordsRoutes);
app.use('/api/suggestions', suggestionsRoutes);
app.use('/api/game-records', gameRecordsRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'BrainGames server is running!' });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

// Start server
const startServer = async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`BrainGames server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
