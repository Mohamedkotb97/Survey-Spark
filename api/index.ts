// Import from source - Vercel will compile TypeScript
// Make sure server directory is included in the function
import app, { initializeApp } from "../server/index";

// Ensure app is initialized for Vercel
if (process.env.VERCEL) {
  // Initialize immediately
  initializeApp().catch((err) => {
    console.error("Failed to initialize app:", err);
  });
}

// Vercel serverless function handler
export default app;
