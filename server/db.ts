import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const initDB = async (): Promise<void> => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        red_stars INTEGER DEFAULT 0,
        blue_stars INTEGER DEFAULT 0,
        green_stars INTEGER DEFAULT 0,
        is_admin BOOLEAN DEFAULT false
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        subject VARCHAR(20) NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        stars INTEGER NOT NULL DEFAULT 0,
        score INTEGER,
        played_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS suggestions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        subject VARCHAR(20),
        image_data TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Database tables initialized');

    // Create admin user if it doesn't exist
    const existing = await pool.query('SELECT id FROM users WHERE username = $1', ['admin']);
    if (existing.rows.length === 0) {
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234';
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await pool.query(
        'INSERT INTO users (username, password_hash, is_admin) VALUES ($1, $2, true)',
        ['admin', passwordHash]
      );
      console.log(`Admin user created (password: ${adminPassword})`);
    }

    const existingGames = await pool.query('SELECT id FROM games WHERE name IN ($1, $2, $3)', ['hebrew-wordle', 'english-wordle', 'math-puzzle']);
    if (existingGames.rows.length < 3) {
      await pool.query(`
        INSERT INTO games (name, subject) VALUES
        ('hebrew-wordle', 'language'),
        ('english-wordle', 'language'),
        ('math-puzzle', 'math');
      `);
      console.log('Default games inserted into database');
    }
  } catch (err) {
    console.error('Error initializing database tables:', (err as Error).message);
  }
};

export { pool, initDB };
