# Survey-Spark

A modern survey application built with React, Express, and TypeScript.

## Features

- Interactive survey interface
- Admin dashboard for survey management
- Real-time data collection
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Express, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (optional - app works with CSV-only mode)

### Installation

1. Clone the repository:
```bash
git clone git@github.com:Mohamedkotb97/Survey-Spark.git
cd Survey-Spark
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (create a `.env` file):
```bash
# Optional: Add database connection string
DATABASE_URL=postgresql://user:password@host:port/database
```

4. Run database migrations (if using database):
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

## Database Setup (Optional)

The app works in CSV-only mode, but you can add a database for persistent storage.

### Recommended: Neon (Free PostgreSQL)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:password@host/dbname`)
4. Add it to Vercel:
   - Go to your Vercel project → Settings → Environment Variables
   - Add `DATABASE_URL` with your connection string
   - Redeploy your application

### Other Free Database Options:
- **Supabase**: [supabase.com](https://supabase.com) - Free PostgreSQL with 500MB
- **Railway**: [railway.app](https://railway.app) - $5 free credit/month
- **Render**: [render.com](https://render.com) - Free PostgreSQL (spins down when idle)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type check
- `npm run db:push` - Push database schema changes

## Deployment

This project is configured for deployment on Vercel.

## License

MIT
