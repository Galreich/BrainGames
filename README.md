# 🧠 BrainGames - משחקי מוח לתלמידי בית ספר יסודי

BrainGames is a full-stack Hebrew/English educational gaming website for elementary school students in Israel.

## Games

- **🔤 Hebrew Wordle** - Guess secret Hebrew words (4-6 letters) with on-screen Hebrew keyboard
- **🔡 English Wordle** - Guess secret English words (4-6 letters) with QWERTY keyboard
- **🚀 Math Number Adventure** - Help an astronaut travel through space by solving math problems across 10 stations

## Tech Stack

- **Frontend:** React (Create React App), React Router, Context API
- **Backend:** Node.js + Express
- **Database:** PostgreSQL

## Project Structure

```
BrainGames/
├── client/               # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   └── StarDisplay.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── HebrewWordle.js
│   │   │   ├── EnglishWordle.js
│   │   │   ├── MathGame.js
│   │   │   └── Login.js
│   │   └── context/
│   │       ├── AuthContext.js
│   │       └── ProgressContext.js
│   └── package.json
│
└── server/               # Express backend
    ├── index.js
    ├── db.js
    ├── routes/
    │   ├── auth.js
    │   ├── progress.js
    │   └── words.js
    ├── data/
    │   ├── hebrew-words.js
    │   └── english-words.js
    ├── .env.example
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

### 3. Set up the server

```bash
cd server
npm install
```

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/braingames
JWT_SECRET=your_super_secret_key_here_make_it_long_and_random
NODE_ENV=development
```

Start the server:

```bash
npm run dev    # development (with nodemon)
# or
npm start      # production
```

### 4. Set up the client

```bash
cd client
npm install
npm start
```

The React app runs on http://localhost:3000 and proxies API calls to http://localhost:5000.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/progress/:userId` | Get user progress (auth required) |
| POST | `/api/progress/save` | Save game progress (auth required) |
| GET | `/api/words/hebrew?length=5` | Get random Hebrew word |
| GET | `/api/words/english?length=5` | Get random English word |
| GET | `/api/words/hebrew/validate?word=שלום` | Validate Hebrew word |
| GET | `/api/words/english/validate?word=happy` | Validate English word |
| GET | `/api/health` | Server health check |

## Progress System

- 🔴 **Red stars** - Math game
- 🔵 **Blue stars** - Hebrew Wordle
- 🟢 **Green stars** - English Wordle

Stars are earned based on:
- **Wordle:** 3 stars (1-2 guesses), 2 stars (3-4 guesses), 1 star (5-6 guesses)
- **Math:** Based on accuracy across all 10 stations

Progress is saved locally (localStorage) even without login. Logging in syncs progress to the server.

## Features

- Full RTL support for Hebrew
- On-screen Hebrew keyboard for Hebrew Wordle
- QWERTY keyboard for English Wordle
- Color-coded feedback (green/yellow/gray tiles)
- Animated rocket path in Math game
- Optional user authentication
- Progress tracking with colored stars
- Responsive design for mobile and desktop
- Child-friendly colorful UI

## Building for Production

```bash
# Build the React app
cd client
npm run build

# The build folder can be served by the Express server
# Add this to server/index.js:
# app.use(express.static(path.join(__dirname, '../client/build')));
```
