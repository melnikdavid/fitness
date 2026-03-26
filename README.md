# FitTrack 💪

A full-stack fitness tracking web app. Log workouts, track sets/reps/weight, and view your history.

## Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: SQLite (local)
- **Auth**: JWT

## Getting Started

### 1. Setup the server

```bash
cd server
cp .env.example .env
npm install
npx prisma db push
npm run dev
```

### 2. Setup the client

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Features

- User registration & login (JWT)
- Log workouts with exercises, sets, reps, and weight
- Dashboard with stats (total workouts, this week, exercises)
- Workout history with search and delete
