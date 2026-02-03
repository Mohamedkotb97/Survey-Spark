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
- PostgreSQL database

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

3. Set up environment variables (create a `.env` file)

4. Run database migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

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
