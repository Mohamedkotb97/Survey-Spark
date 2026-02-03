import app, { initializeApp } from "../server/index";

// Ensure app is initialized before handling requests
if (process.env.VERCEL) {
  initializeApp().catch(console.error);
}

// Vercel serverless function handler
export default app;
