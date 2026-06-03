# 🧠 BrainGames - משחקי חשיבה לתלמידי בית ספר יסודי
> A colorful, gamified learning platform where kids sharpen their math, Hebrew, and English skills—one star at a time.

**🌐 Play now:** https://braingames-client.vercel.app

---

## 🎮 Games

| Game | Description |
|------|-------------|
| **🔤 Hebrew Wordle** | Guess secret Hebrew words (4–6 letters) with on-screen & physical Hebrew keyboard |
| **🔡 English Wordle** | Guess secret English words (4–6 letters) with QWERTY keyboard (on-screen & physical) |
| **🚀 Math Number Adventure** | Help an astronaut travel through space by solving math problems across 10 stations |

## ⭐ Progress System

Each game awards colored stars:

| Color | Game | How to earn |
|-------|------|-------------|
| 🔴 Red | Math Adventure | Score at least 5/10 correct answers |
| 🔵 Blue | Hebrew Wordle | Guess the word within 6 attempts |
| 🟢 Green | English Wordle | Guess the word within 6 attempts |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, React Router, MUI, i18next |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL |
| **Deployment** | Vercel (serverless functions + static frontend) |

## 📁 Project Structure

```
BrainGames/
├── api/                  # Vercel serverless entry point
│   └── index.ts
├── vercel.json
├── client/               # React frontend (Vite + TypeScript)
│   ├── public/           # SVG game illustrations
│   └── src/
│       ├── components/   # Header, StarDisplay, Tile, Confetti, etc.
│       ├── pages/        # Home, Wordle, MathGame, Login, Admin, etc.
│       ├── context/      # AuthContext, ProgressContext
│       ├── utils/        # API helpers, emoji utilities
│       ├── i18n.ts       # Internationalization setup
│       └── App.tsx
└── server/               # Express backend (TypeScript)
    ├── routes/           # auth, words, progress, gameRecords, suggestions, admin
    ├── data/             # Hebrew & English word lists
    ├── types/            # TypeScript declarations
    ├── tests/            # Jest + Supertest integration tests
    ├── db.ts             # PostgreSQL connection & schema init
    └── index.ts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- PostgreSQL v13+

### 1. Set up the database

```sql
CREATE DATABASE braingames;
```

Tables are created automatically when the server starts.

### 2. Install dependencies

```bash
npm run install:all
```

### 3. Configure the server

Create `server/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/braingames
JWT_SECRET=your_super_secret_key_here_make_it_long_and_random
NODE_ENV=development
```

### 4. Run

```bash
# Terminal 1 — server
cd server
npm run dev

# Terminal 2 — client
cd client
npm start
```

The client runs on http://localhost:5173 and proxies API calls to the server.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user (auth required) |

### Games & Words
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/words/hebrew?length=5` | Random Hebrew word |
| GET | `/api/words/english?length=5` | Random English word |
| GET | `/api/words/hebrew/validate?word=שלום` | Validate Hebrew word |
| GET | `/api/words/english/validate?word=happy` | Validate English word |

### Progress & Records
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress/:userId` | User progress (auth required) |
| POST | `/api/game-records` | Save game record (auth required) |
| GET | `/api/game-records/summary` | Game records summary (auth required) |

### Suggestions & Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/suggestions` | Submit suggestion (auth required) |
| GET | `/api/admin/*` | Admin endpoints (admin only) |
| GET | `/api/health` | Server health check |

---

## 🔐 Authentication

- Username + password registration and login
- Password: minimum 6 characters, must include at least one letter and one number
- JWT-based (7-day token expiry)
- Guest play supported (progress not saved to server)

---

## ✨ Features

- Full RTL support for Hebrew
- Hebrew/English internationalization (i18next)
- Physical & on-screen keyboards (Hebrew + QWERTY)
- Unified Wordle component supporting both languages
- Color-coded tile feedback (green / yellow / gray)
- Animated rocket path in Math game with menu and game-over screens
- Colored star progress system (red / blue / green)
- Game suggestion system with image upload
- Admin panel for managing users and content
- Confetti and star burst animations
- Responsive design for mobile and desktop
- Child-friendly colorful UI (Material UI)

---

## 🧪 Testing

The server includes **51 integration tests** using Jest + Supertest.

```bash
cd server
npm test
```

Full results are saved in `server/tests/test-results.txt`.

| Category | Tests | Status |
|----------|:-----:|:------:|
| הרשמה למערכת (Registration) | 7 | ✅ |
| התחברות למערכת (Login) | 5 | ✅ |
| אבטחת משתמשים (User Security) | 2 | ✅ |
| הרשאות וגישה (Authorization) | 4 | ✅ |
| הרשאות מנהל (Admin Permissions) | 2 | ✅ |
| טוקן פג תוקף (Expired Token) | 1 | ❌ |
| ולידציה - שם משתמש (Username Validation) | 1 | ❌ |
| ולידציה - ניקוד שלילי (Score Validation) | 1 | ❌ |
| משחק מילים בעברית (Hebrew Wordle) | 4 | ✅ |
| משחק מילים באנגלית (English Wordle) | 5 | ✅ |
| משחק מתמטיקה (Math Game) | 3 | ✅ |
| שמירת תוצאות משחק (Game Records) | 6 | ✅ |
| התקדמות משתמש (User Progress) | 2 | ✅ |
| סיכום תוצאות (Summary) | 2 | ✅ |
| הצעות משתמשים (Suggestions) | 6 | ✅ |
| **Total** | **51** | **48 ✅  3 ❌** |

### Failed tests — known issues

| Test | Expected | Actual | Reason |
|------|----------|--------|--------|
| `testExpiredTokenReturns401` | 401 | 403 | Server returns 403 for all invalid tokens, doesn't distinguish expired |
| `testRegisterUsernameWithSpecialChars` | 400 | 201 | No validation on special characters in username (XSS risk) |
| `testSaveGameRecordNegativeScore` | 400 | 201 | Server validates stars but not score values |

---

## 📦 Deployment

The project is deployed on Vercel. The `vercel.json` configures:
- Serverless API function (`api/index.ts`)
- SPA rewrites for client-side routing
- Build output from `client/dist/`

```bash
cd client
npm run build
```
The project is configured for deployment on Vercel:

```bash
# Build the React app
cd client
npm run build
# Output is in client/dist/
```

The `vercel.json` configures the serverless API function (`api/index.ts`) and rewrites for SPA routing.
The project is configured for deployment on Vercel:

```bash
# Build the React app
cd client
npm run build
# Output is in client/dist/
```

The `vercel.json` configures the serverless API function (`api/index.ts`) and rewrites for SPA routing.
