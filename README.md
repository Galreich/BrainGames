# 🧠 BrainGames - משחקי חשיבה לתלמידי בית ספר יסודי

BrainGames is a full-stack Hebrew/English educational gaming website for elementary school students in Israel.

**Play now:** https://braingames-client.vercel.app

## Games

- **🔤 Hebrew Wordle** - Guess secret Hebrew words (4-6 letters) with on-screen & physical Hebrew keyboard
- **🔡 English Wordle** - Guess secret English words (4-6 letters) with QWERTY keyboard (on-screen & physical)
- **🚀 Math Number Adventure** - Help an astronaut travel through space by solving math problems across 10 stations

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, React Router, i18next
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL
- **Deployment:** Vercel (serverless functions + static frontend)

## Project Structure

```
BrainGames/
├── api/                  # Vercel serverless function entry point
│   └── index.ts
├── vercel.json           # Vercel deployment config
├── client/               # React frontend (Vite + TypeScript)
│   ├── index.html
│   ├── vite.config.js
│   ├── public/
│   │   ├── math-game.svg
│   │   ├── hebrew-wordle.svg
│   │   └── english-wordle.svg
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.tsx
│   │   ├── index.css
│   │   ├── i18n.ts
│   │   ├── heTranslations.ts
│   │   ├── utils/
│   │   │   ├── api.ts
│   │   │   └── Emojis.ts
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── HeaderNav.tsx
│   │   │   ├── HeaderUserActions.tsx
│   │   │   ├── StarDisplay.tsx
│   │   │   ├── StarsProgressBar.tsx
│   │   │   ├── GameCard.tsx
│   │   │   ├── Tile.tsx
│   │   │   ├── SuggestionModal.tsx
│   │   │   ├── SuggestionImageUpload.tsx
│   │   │   ├── SuggestionSuccess.tsx
│   │   │   ├── BackgroundStar.tsx
│   │   │   ├── Confetti.tsx
│   │   │   └── StarBurst.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Wordle.tsx
│   │   │   ├── MathGame.tsx
│   │   │   ├── MathGameMenu.tsx
│   │   │   ├── MathGamePlaying.tsx
│   │   │   ├── MathGameOver.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── AdminPage.tsx
│   │   │   └── Instructions.tsx
│   │   └── context/
│   │       ├── AuthContext.tsx
│   │       └── ProgressContext.tsx
│   └── package.json
│
└── server/               # Express backend (TypeScript)
    ├── index.ts
    ├── db.ts
    ├── tsconfig.json
    ├── types/
    │   ├── express.d.ts
    │   └── word-list.d.ts
    ├── routes/
    │   ├── auth.ts
    │   ├── progress.ts
    │   ├── words.ts
    │   ├── suggestions.ts
    │   ├── gameRecords.ts
    │   └── admin.ts
    ├── data/
    │   ├── hebrew-words.ts
    │   └── english-words.ts
    └── package.json
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)

### 1. Clone/download the project

```bash
cd BrainGames
```

### 2. Set up the database

Create a PostgreSQL database:

```sql
CREATE DATABASE braingames;
```

The tables are created automatically when the server starts.

### 3. Install all dependencies

```bash
npm run install:all
```

Or manually:

```bash
cd server && npm install
cd ../client && npm install
```

### 4. Set up the server

Create a `.env` file in the `server/` directory:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/braingames
JWT_SECRET=your_super_secret_key_here_make_it_long_and_random
NODE_ENV=development
```

Start the server:

```bash
cd server
npm run dev    # development (with nodemon + ts-node)
# or
npm start      # production (ts-node)
```

### 5. Set up the client

```bash
cd client
npm start
```

The React app runs on http://localhost:5173 (Vite default) and proxies API calls to the server.

## API Endpoints

| Method | Endpoint                                 | Description                              |
| ------ | ---------------------------------------- | ---------------------------------------- |
| POST   | `/api/auth/register`                     | Register new user                        |
| POST   | `/api/auth/login`                        | Login user                               |
| GET    | `/api/auth/me`                           | Get current user data (auth required)    |
| GET    | `/api/progress/:userId`                  | Get user progress (auth required)        |
| POST   | `/api/progress/save`                     | Save game progress (auth required)       |
| GET    | `/api/words/hebrew?length=5`             | Get random Hebrew word                   |
| GET    | `/api/words/english?length=5`            | Get random English word                  |
| GET    | `/api/words/hebrew/validate?word=שלום`   | Validate Hebrew word                     |
| GET    | `/api/words/english/validate?word=happy` | Validate English word                    |
| POST   | `/api/suggestions`                       | Submit a game suggestion (auth required) |
| GET    | `/api/game-records/summary`              | Get game records summary (auth required) |
| POST   | `/api/game-records`                      | Save a game record (auth required)       |
| GET    | `/api/admin/*`                           | Admin endpoints (admin required)         |
| GET    | `/api/health`                            | Server health check                      |

## Progress System

- 🔴 **Red stars** - Math game
- 🔵 **Blue stars** - Hebrew Wordle
- 🟢 **Green stars** - English Wordle

Stars are earned based on:

- **Wordle:** 1 star for guessing the word (within 6 attempts)
- **Math:** 1 star if at least half the questions (5/10) are answered correctly, 0 stars otherwise

## Authentication

- Username + password registration and login
- Password requirements: minimum 6 characters, must include at least one letter and one number
- JWT-based authentication (7-day token expiry)
- Guest play supported (without saving progress to server)

## Features

- Full RTL support for Hebrew
- Hebrew/English internationalization (i18next)
- Physical & on-screen Hebrew keyboard for Hebrew Wordle
- Physical & on-screen QWERTY keyboard for English Wordle
- Unified Wordle component supporting both languages
- Color-coded feedback (green/yellow/gray tiles)
- Animated rocket path in Math game with menu and game-over screens
- User authentication with progress tracking
- Colored star system (red/blue/green per game)
- Game suggestion system with image upload
- Admin panel for managing users and content
- Confetti and star burst animations
- SVG illustrations on game cards
- Responsive design for mobile and desktop
- Child-friendly colorful UI (Material UI)

## Testing

The server includes a comprehensive test suite with 48 integration tests using Jest and Supertest.

Run the tests:

```bash
cd server
npm test
```

Test results are saved under `server/tests/test-results.txt`.

| Category                  | Tests |
| ------------------------- | ----- |
| הרשמה למערכת (Registration)        | 7     |
| התחברות למערכת (Login)             | 5     |
| אבטחת משתמשים (User Security)     | 2     |
| הרשאות וגישה (Authorization)      | 4     |
| הרשאות מנהל (Admin Permissions)   | 2     |
| משחק מילים בעברית (Hebrew Wordle)  | 4     |
| משחק מילים באנגלית (English Wordle) | 5     |
| משחק מתמטיקה (Math Game)          | 3     |
| שמירת תוצאות משחק (Game Records)   | 6     |
| התקדמות משתמש (User Progress)     | 2     |
| סיכום תוצאות (Summary)            | 2     |
| הצעות משתמשים (Suggestions)       | 6     |
| **סה"כ**                          | **48** |

## Deployment

The project is configured for deployment on Vercel:

```bash
# Build the React app
cd client
npm run build
# Output is in client/dist/
```

The `vercel.json` configures the serverless API function (`api/index.ts`) and rewrites for SPA routing.
