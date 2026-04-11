# 🧠 BrainGames - משחקי חשיבה לתלמידי בית ספר יסודי

BrainGames is a full-stack Hebrew/English educational gaming website for elementary school students in Israel.

## Games

- **🔤 Hebrew Wordle** - Guess secret Hebrew words (4-6 letters) with on-screen & physical Hebrew keyboard
- **🔡 English Wordle** - Guess secret English words (4-6 letters) with QWERTY keyboard (on-screen & physical)
- **🚀 Math Number Adventure** - Help an astronaut travel through space by solving math problems across 10 stations

## Tech Stack

- **Frontend:** React 18, Vite, React Router, Context API
- **Backend:** Node.js + Express
- **Database:** PostgreSQL

## Project Structure

```
BrainGames/
├── client/               # React frontend (Vite)
│   ├── index.html
│   ├── vite.config.js
│   ├── public/
│   │   ├── math-game.svg
│   │   ├── hebrew-wordle.svg
│   │   └── english-wordle.svg
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── StarDisplay.jsx
│   │   │   └── SuggestionModal.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── HebrewWordle.jsx
│   │   │   ├── EnglishWordle.jsx
│   │   │   ├── MathGame.jsx
│   │   │   ├── Login.jsx
│   │   │   └── AdminPage.jsx
│   │   └── context/
│   │       ├── AuthContext.jsx
│   │       └── ProgressContext.jsx
│   └── package.json
│
└── server/               # Express backend
    ├── index.js
    ├── db.js
    ├── routes/
    │   ├── auth.js
    │   ├── progress.js
    │   ├── words.js
    │   ├── suggestions.js
    │   ├── gameRecords.js
    │   └── admin.js
    ├── data/
    │   ├── hebrew-words.js
    │   └── english-words.js
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

Create a `.env` file:

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
- Physical & on-screen Hebrew keyboard for Hebrew Wordle
- Physical & on-screen QWERTY keyboard for English Wordle
- Color-coded feedback (green/yellow/gray tiles)
- Animated rocket path in Math game
- User authentication with progress tracking
- Colored star system (red/blue/green per game)
- Game suggestion system for users
- Admin panel for managing users and content
- SVG illustrations on game cards
- Responsive design for mobile and desktop
- Child-friendly colorful UI

## Building for Production

```bash
# Build the React app
cd client
npm run build

# The build output is in client/dist/
# Serve it with the Express server by adding:
# app.use(express.static(path.join(__dirname, '../client/dist')));
```
