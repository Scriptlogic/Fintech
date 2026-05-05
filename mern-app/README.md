# MERN Stack App

Full-stack MERN application with React + Vite frontend and Express + MongoDB backend.

## Project Structure

```
mern-app/
├── client/          # React + Vite frontend
└── server/          # Node.js + Express backend
```

## Prerequisites

- Node.js v18+
- MongoDB running locally on port 27017 (or update MONGO_URI in server/.env)

## Setup & Run

### Backend (Server)

```bash
cd server
npm install       # already done if you followed setup
npm run dev       # starts with nodemon on http://localhost:5000
```

### Frontend (Client)

```bash
cd client
npm install       # already done if you followed setup
npm run dev       # starts Vite dev server on http://localhost:3000
```

## Environment Variables

Edit `server/.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/mernapp
```

## API Endpoints

| Method | Endpoint         | Description       |
|--------|------------------|-------------------|
| GET    | /api/items       | Get all items     |
| GET    | /api/items/:id   | Get single item   |
| POST   | /api/items       | Create item       |
| PUT    | /api/items/:id   | Update item       |
| DELETE | /api/items/:id   | Delete item       |

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Axios, Framer Motion
- **Backend**: Node.js, Express, Mongoose, CORS, dotenv
