import request from 'supertest';
import app from '../index';
import { pool } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

let testUserToken: string;
let testUserId: number;
let adminToken: string;
let adminUserId: number;

const uniqueSuffix = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

beforeAll(async () => {
  // Wait for DB init (the app middleware calls ensureDB)
  await request(app).get('/api/health');

  // Create a regular test user
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({ username: `testuser_${uniqueSuffix()}`, password: 'Test1234' });
  testUserToken = regRes.body.token;
  testUserId = regRes.body.user.id;

  // Ensure admin user exists and get a token
  const adminUsername = 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234';
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ username: adminUsername, password: adminPassword });
  adminToken = loginRes.body.token;
  adminUserId = loginRes.body.user.id;
});

afterAll(async () => {
  // Clean up the test user
  if (testUserId) {
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
  }
  await pool.end();
});

// ======================== הרשמה למערכת ========================

describe('Registration', () => {
  const createdUserIds: number[] = [];

  afterAll(async () => {
    for (const id of createdUserIds) {
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
    }
  });

  test('testRegisterValidUser', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: `valid_${uniqueSuffix()}`, password: 'Abc123' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).toHaveProperty('username');
    createdUserIds.push(res.body.user.id);
  });

  test('testRegisterWithoutUsername', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ password: 'Abc123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Username_and_password_required');
  });

  test('testRegisterWithoutPassword', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'someuser' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Username_and_password_required');
  });

  test('testRegisterInvalidUsernameLength', async () => {
    // Too short (1 character)
    const resTooShort = await request(app)
      .post('/api/auth/register')
      .send({ username: 'a', password: 'Abc123' });
    expect(resTooShort.status).toBe(400);
    expect(resTooShort.body.error).toBe('Username_length_error');

    // Too long (51 characters)
    const resTooLong = await request(app)
      .post('/api/auth/register')
      .send({ username: 'a'.repeat(51), password: 'Abc123' });
    expect(resTooLong.status).toBe(400);
    expect(resTooLong.body.error).toBe('Username_length_error');
  });

  test('testRegisterPasswordTooShort', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: `short_${uniqueSuffix()}`, password: 'Ab1' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Password_min_length');
  });

  test('testRegisterWeakPassword', async () => {
    // No digit
    const resNoDigit = await request(app)
      .post('/api/auth/register')
      .send({ username: `weak1_${uniqueSuffix()}`, password: 'abcdef' });
    expect(resNoDigit.status).toBe(400);
    expect(resNoDigit.body.error).toBe('Password_requirements');

    // No letter
    const resNoLetter = await request(app)
      .post('/api/auth/register')
      .send({ username: `weak2_${uniqueSuffix()}`, password: '123456' });
    expect(resNoLetter.status).toBe(400);
    expect(resNoLetter.body.error).toBe('Password_requirements');
  });

  test('testRegisterExistingUsername', async () => {
    const username = `dup_${uniqueSuffix()}`;
    const first = await request(app)
      .post('/api/auth/register')
      .send({ username, password: 'Abc123' });
    expect(first.status).toBe(201);
    createdUserIds.push(first.body.user.id);

    const second = await request(app)
      .post('/api/auth/register')
      .send({ username, password: 'Abc123' });
    expect(second.status).toBe(409);
    expect(second.body.error).toBe('Username_exists');
  });
});

// ======================== התחברות למערכת ========================

describe('Login', () => {
  const loginUsername = `login_${uniqueSuffix()}`;
  const loginPassword = 'Login123';
  let loginUserId: number;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: loginUsername, password: loginPassword });
    loginUserId = res.body.user.id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE id = $1', [loginUserId]);
  });

  test('testLoginValidUser', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: loginUsername, password: loginPassword });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Login_success');
    expect(res.body.user.username).toBe(loginUsername);
  });

  test('testLoginMissingFields', async () => {
    const resNoUser = await request(app)
      .post('/api/auth/login')
      .send({ password: loginPassword });
    expect(resNoUser.status).toBe(400);

    const resNoPass = await request(app)
      .post('/api/auth/login')
      .send({ username: loginUsername });
    expect(resNoPass.status).toBe(400);
  });

  test('testLoginUnknownUser', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nonexistent_user_xyz', password: 'Test1234' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid_credentials');
  });

  test('testLoginWrongPassword', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: loginUsername, password: 'WrongPass1' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid_credentials');
  });

  test('testLoginReturnsToken', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: loginUsername, password: loginPassword });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.length).toBeGreaterThan(0);
  });
});

// ======================== אבטחת משתמשים ========================

describe('User Security', () => {
  test('testPasswordIsHashed', async () => {
    const { rows } = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [testUserId],
    );
    expect(rows.length).toBe(1);
    const hash = rows[0].password_hash;
    // bcrypt hashes start with $2a$ or $2b$
    expect(hash).toMatch(/^\$2[ab]\$/);
    expect(hash).not.toBe('Test1234');
  });

  test('testPasswordCompareWithHash', async () => {
    const { rows } = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [testUserId],
    );
    const hash = rows[0].password_hash;
    const isMatch = await bcrypt.compare('Test1234', hash);
    expect(isMatch).toBe(true);

    const isWrong = await bcrypt.compare('WrongPassword1', hash);
    expect(isWrong).toBe(false);
  });
});

// ======================== הרשאות וגישה ========================

describe('Authorization & Access', () => {
  test('testProtectedRouteWithoutToken', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Login_required');
  });

  test('testProtectedRouteInvalidToken', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken123');
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Invalid_token');
  });

  test('testGetMeWithValidToken', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${testUserToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', testUserId);
    expect(res.body).toHaveProperty('username');
    expect(res.body).toHaveProperty('red_stars');
    expect(res.body).toHaveProperty('blue_stars');
    expect(res.body).toHaveProperty('green_stars');
  });

  test('testUserCannotAccessOtherUserProgress', async () => {
    const otherUserId = adminUserId;
    const res = await request(app)
      .get(`/api/progress/${otherUserId}`)
      .set('Authorization', `Bearer ${testUserToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Unauthorized_progress_access');
  });
});

// ======================== הרשאות מנהל ========================

describe('Admin Permissions', () => {
  test('testRegularUserCannotAccessAdmin', async () => {
    const res = await request(app)
      .get('/api/admin/suggestions')
      .set('Authorization', `Bearer ${testUserToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Admin_only');
  });

  test('testAdminCanViewSuggestions', async () => {
    const res = await request(app)
      .get('/api/admin/suggestions')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('suggestions');
    expect(Array.isArray(res.body.suggestions)).toBe(true);
  });
});

// ======================== משחק מילים בעברית ========================

describe('Hebrew Wordle', () => {
  test('testGetHebrewWordValidLength', async () => {
    for (const length of [4, 5, 6]) {
      const res = await request(app).get(`/api/words/hebrew?length=${length}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('word');
      expect(res.body.word.length).toBe(length);
      expect(res.body.language).toBe('hebrew');
    }
  });

  test('testGetHebrewWordInvalidLength', async () => {
    for (const length of [2, 3, 7, 10]) {
      const res = await request(app).get(`/api/words/hebrew?length=${length}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Word_length_invalid');
    }
  });

  test('testValidateValidHebrewWord', async () => {
    // Get a word from the server first, then validate it
    const wordRes = await request(app).get('/api/words/hebrew?length=5');
    const word = wordRes.body.word;

    const res = await request(app).get(
      `/api/words/hebrew/validate?word=${encodeURIComponent(word)}`,
    );
    expect(res.status).toBe(200);
    expect(res.body.isValid).toBe(true);
  });

  test('testValidateInvalidHebrewWord', async () => {
    const res = await request(app).get(
      `/api/words/hebrew/validate?word=${encodeURIComponent('אאאאא')}`,
    );
    expect(res.status).toBe(200);
    expect(res.body.isValid).toBe(false);
  });
});

// ======================== משחק מילים באנגלית ========================

describe('English Wordle', () => {
  test('testGetEnglishWordValidLength', async () => {
    for (const length of [4, 5, 6]) {
      const res = await request(app).get(`/api/words/english?length=${length}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('word');
      expect(res.body.word.length).toBe(length);
      expect(res.body.language).toBe('english');
    }
  });

  test('testGetEnglishWordInvalidLength', async () => {
    for (const length of [2, 3, 7, 10]) {
      const res = await request(app).get(`/api/words/english?length=${length}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Word_length_invalid');
    }
  });

  test('testValidateValidEnglishWord', async () => {
    const res = await request(app).get('/api/words/english/validate?word=happy');
    expect(res.status).toBe(200);
    expect(res.body.isValid).toBe(true);
  });

  test('testValidateEnglishWordCaseInsensitive', async () => {
    const resUpper = await request(app).get('/api/words/english/validate?word=HAPPY');
    expect(resUpper.status).toBe(200);
    expect(resUpper.body.isValid).toBe(true);

    const resMixed = await request(app).get('/api/words/english/validate?word=HaPpY');
    expect(resMixed.status).toBe(200);
    expect(resMixed.body.isValid).toBe(true);
  });

  test('testValidateInvalidEnglishWord', async () => {
    const res = await request(app).get('/api/words/english/validate?word=zzzzz');
    expect(res.status).toBe(200);
    expect(res.body.isValid).toBe(false);
  });
});

// ======================== משחק מתמטיקה ========================

describe('Math Game', () => {
  test('testMathPuzzleCorrectAnswer', async () => {
    const res = await request(app)
      .post('/api/game-records')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ game: 'math-puzzle', stars: 1, score: 10 });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Record_saved');
    expect(res.body.red_stars).toBeGreaterThanOrEqual(1);
  });

  test('testMathPuzzleWrongAnswer', async () => {
    const res = await request(app)
      .post('/api/game-records')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ game: 'math-puzzle', stars: 0, score: 3 });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Record_saved');
  });

  test('testMathPuzzleGameEndsCorrectly', async () => {
    const res = await request(app)
      .post('/api/game-records')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ game: 'math-puzzle', stars: 1, score: 10 });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('red_stars');
    expect(res.body).toHaveProperty('blue_stars');
    expect(res.body).toHaveProperty('green_stars');
  });
});

// ======================== שמירת תוצאות משחק ========================

describe('Save Game Records', () => {
  test('testSaveGameRecordValidUser', async () => {
    const res = await request(app)
      .post('/api/game-records')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ game: 'hebrew-wordle', stars: 1, score: 4 });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Record_saved');
  });

  test('testSaveGameRecordWithoutToken', async () => {
    const res = await request(app)
      .post('/api/game-records')
      .send({ game: 'hebrew-wordle', stars: 1 });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Login_required');
  });

  test('testSaveGameRecordMissingGame', async () => {
    const res = await request(app)
      .post('/api/game-records')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ stars: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Missing_game_records_fields');
  });

  test('testSaveGameRecordMissingStars', async () => {
    const res = await request(app)
      .post('/api/game-records')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ game: 'hebrew-wordle' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Missing_game_records_fields');
  });

  test('testSaveGameRecordInvalidGame', async () => {
    const res = await request(app)
      .post('/api/game-records')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ game: 'nonexistent-game', stars: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid_game');
  });

  test('testSaveGameRecordUpdatesStars', async () => {
    const beforeRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${testUserToken}`);
    const beforeBlue = beforeRes.body.blue_stars;

    await request(app)
      .post('/api/game-records')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ game: 'hebrew-wordle', stars: 1 });

    const afterRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${testUserToken}`);
    expect(afterRes.body.blue_stars).toBe(beforeBlue + 1);
  });
});

// ======================== התקדמות משתמש ========================

describe('User Progress', () => {
  test('testGetUserProgress', async () => {
    const res = await request(app)
      .get(`/api/progress/${testUserId}`)
      .set('Authorization', `Bearer ${testUserToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('progress');
    expect(res.body.progress).toHaveProperty('math-puzzle');
    expect(res.body.progress).toHaveProperty('hebrew-wordle');
    expect(res.body.progress).toHaveProperty('english-wordle');
  });

  test('testProgressDefaultValues', async () => {
    // Create a fresh user with no game records
    const freshUsername = `fresh_${uniqueSuffix()}`;
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ username: freshUsername, password: 'Fresh123' });
    const freshToken = regRes.body.token;
    const freshId = regRes.body.user.id;

    const res = await request(app)
      .get(`/api/progress/${freshId}`)
      .set('Authorization', `Bearer ${freshToken}`);
    expect(res.status).toBe(200);

    const progress = res.body.progress;
    for (const game of ['math-puzzle', 'hebrew-wordle', 'english-wordle']) {
      expect(progress[game].stars).toBe(0);
      expect(progress[game].gamesPlayed).toBe(0);
    }

    await pool.query('DELETE FROM users WHERE id = $1', [freshId]);
  });
});

// ======================== סיכום תוצאות ========================

describe('Game Records Summary', () => {
  test('testGetGameRecordsSummary', async () => {
    const res = await request(app)
      .get('/api/game-records/summary')
      .set('Authorization', `Bearer ${testUserToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('math-puzzle');
    expect(res.body).toHaveProperty('hebrew-wordle');
    expect(res.body).toHaveProperty('english-wordle');
  });

  test('testSummaryIncludesAllGames', async () => {
    const res = await request(app)
      .get('/api/game-records/summary')
      .set('Authorization', `Bearer ${testUserToken}`);
    expect(res.status).toBe(200);

    for (const game of ['math-puzzle', 'hebrew-wordle', 'english-wordle']) {
      expect(res.body[game]).toHaveProperty('stars');
      expect(res.body[game]).toHaveProperty('games_played');
    }
  });
});

// ======================== הצעות משתמשים ========================

describe('User Suggestions', () => {
  test('testSubmitSuggestionValidUser', async () => {
    const res = await request(app)
      .post('/api/suggestions')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ title: 'משחק חדש', description: 'משחק זיכרון עם כרטיסיות' });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Suggestion_success_message');
    expect(res.body.suggestion).toHaveProperty('id');
  });

  test('testSubmitSuggestionWithoutToken', async () => {
    const res = await request(app)
      .post('/api/suggestions')
      .send({ title: 'Test', description: 'Test desc' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Login_required');
  });

  test('testSubmitSuggestionWithoutTitle', async () => {
    const res = await request(app)
      .post('/api/suggestions')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ description: 'Some description' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Suggestion_title_required');
  });

  test('testSubmitSuggestionWithoutDescription', async () => {
    const res = await request(app)
      .post('/api/suggestions')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ title: 'Some title' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Suggestion_description_required');
  });

  test('testSubmitSuggestionTitleTooLong', async () => {
    const res = await request(app)
      .post('/api/suggestions')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ title: 'a'.repeat(21), description: 'Valid description' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Suggestion_title_too_long');
  });

  test('testSubmitSuggestionDescriptionTooLong', async () => {
    const res = await request(app)
      .post('/api/suggestions')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ title: 'Valid title', description: 'a'.repeat(1001) });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Suggestion_description_too_long');
  });
});
