# Fluxora

Smart Industrial Waste Marketplace — A final-year college project.

## Quick Start

### Prerequisites
- Node.js v18+ and npm
- MongoDB (local or free Atlas cluster)

### Setup

```bash
# 1. Clone and install
git clone <repo-url> fluxora
cd fluxora
npm run install-all

# 2. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and optional API keys

# 3. Seed demo data
npm run seed

# 4. Start development
npm run dev
```

This starts both the API server (port 5000) and React client (port 5173).

### Demo Logins (after seeding)
| Role   | Email               | Password   |
|--------|---------------------|------------|
| Admin  | admin@fluxora.com   | admin123   |
| Seller | seller1@test.com    | password123|
| Buyer  | buyer1@test.com     | password123|

## Tech Stack
- **Frontend:** React.js (Vite), Tailwind CSS, React Router, Recharts
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Auth:** JWT + bcryptjs

## Project Structure
```
fluxora/
├── frontend/        # React + Vite + Tailwind CSS
├── backend/         # Express.js REST API + MongoDB
├── docs/            # Project documentation and viva prep
└── .env.example     # Environment variables template
```

## Deployment on Vercel

Fluxora is pre-configured for seamless Vercel deployment:

### Option A: Monorepo Fullstack Deployment (Recommended)
1. Import the root repository in Vercel.
2. Root `vercel.json` and `api/index.js` automatically serve:
   - Frontend React SPA from `frontend/dist`
   - Express backend as a Serverless function under `/api/*`
3. Add environment variables in Vercel Project Settings:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Production secret key
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (for image uploads)
   - `OPENROUTER_API_KEY` (optional, for Meta LLaMA 3.3 70B AI)

### Option B: Frontend Only on Vercel
1. Set **Root Directory** to `frontend`.
2. `frontend/vercel.json` automatically handles SPA routing.
3. In Vercel Environment Variables, set:
   - `VITE_API_URL`: URL of your deployed backend (e.g. `https://your-api.onrender.com/api`)

See `/docs` for full documentation including API reference, architecture diagrams, and viva prep.
