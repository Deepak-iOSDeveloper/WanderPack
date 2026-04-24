# WanderPack

WanderPack now has two layers in the repo:

- `src/`: the existing Vite + React frontend
- `server/`: a new Express + MongoDB backend

## Current state

The frontend still uses Firebase for the app's live auth and data flows today.
The new backend gives you a proper MongoDB foundation so we can migrate features off Firebase incrementally instead of rewriting everything at once.

## Frontend setup

Copy `.env.example` to `.env` and add your Firebase web config values:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```

## Backend setup

Copy `server/.env.example` to `server/.env` and add your MongoDB connection string:

```env
PORT=5000
CLIENT_URL=http://127.0.0.1:5173
MONGODB_URI=mongodb://127.0.0.1:27017/wanderpack
```

## MongoDB backend routes

- `GET /api/health`
- `GET /api/users`
- `POST /api/users`
- `GET /api/trips`
- `POST /api/trips`

## Run locally

Install dependencies:

```bash
npm install
npm --prefix server install
```

Run the frontend:

```bash
npm run dev:client
```

Run the backend:

```bash
npm run dev:server
```

The Vite dev server proxies `/api/*` requests to `http://127.0.0.1:5000`.

## Next migration step

If you want MongoDB to become the real source of truth, the next step is to replace the Firebase calls inside:

- `src/contexts/AuthContext.tsx`
- `src/contexts/AppDataContext.tsx`
- `src/lib/firebase.ts`

with API calls to the new backend.
