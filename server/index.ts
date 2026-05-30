import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { initDB } from './db';

import {
  authRoutes,
  progressRoutes,
  wordsRoutes,
  suggestionsRoutes,
  gameRecordsRoutes,
  adminRoutes,
} from './routes/index';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGIN || 'https://braingames-eosin.vercel.app'
        : ['http://localhost:3000'],
    credentials: true,
  }),
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Health check (before DB middleware so it always responds)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'BrainGames server is running!' });
});

// DB initialization — runs once per cold start (serverless) or on boot (local)
let dbReady: Promise<void> | null = null;
function ensureDB() {
  if (!dbReady) {
    dbReady = initDB().catch((err) => {
      dbReady = null; // allow retry on next request
      throw err;
    });
  }
  return dbReady;
}

// Ensure DB is initialized before handling requests
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await ensureDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/words', wordsRoutes);
app.use('/api/suggestions', suggestionsRoutes);
app.use('/api/game-records', gameRecordsRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

// Export the app for Vercel serverless
export default app;

// Start server only when running locally (not on Vercel)
if (!process.env.VERCEL) {
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
}
