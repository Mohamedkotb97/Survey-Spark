// Use the built server file which bundles everything
// This is created by npm run build -> dist/index.js
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the built server (ESM bundle)
// The build process creates dist/index.js which includes everything
const serverPath = join(__dirname, "..", "dist", "index.js");

// Load the server app (cached)
let appPromise: Promise<any> | null = null;

async function loadApp() {
  if (appPromise) return appPromise;
  
  appPromise = (async () => {
    if (!existsSync(serverPath)) {
      console.error(`Server build not found at: ${serverPath}`);
      console.error("Current directory:", process.cwd());
      console.error("__dirname:", __dirname);
      
      // Fallback: create a minimal error handler
      const errorApp = express();
      errorApp.use((req: any, res: any) => {
        res.status(500).json({ 
          error: "Server build not found",
          message: "The built server file (dist/index.js) was not found. Make sure 'npm run build' completed successfully during deployment.",
          path: serverPath,
          cwd: process.cwd()
        });
      });
      return errorApp;
    }
    
    try {
      // For ESM modules, use dynamic import
      const serverModule = await import(serverPath);
      // The built server exports the app as default
      const app = serverModule.default || serverModule;
      
      if (!app) {
        throw new Error("Built server module does not export an Express app");
      }
      
      console.log("Successfully loaded Express app from built server");
      return app;
    } catch (error) {
      console.error("Error loading server:", error);
      // Fallback: create a minimal error handler
      const errorApp = express();
      errorApp.use((req: any, res: any) => {
        res.status(500).json({ 
          error: "Failed to load server",
          message: error instanceof Error ? error.message : String(error),
          path: serverPath
        });
      });
      return errorApp;
    }
  })();
  
  return appPromise;
}

// Export handler that ensures app is loaded
export default async (req: any, res: any) => {
  const app = await loadApp();
  return app(req, res);
};
