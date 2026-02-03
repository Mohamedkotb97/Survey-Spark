// Use the built server file which bundles everything
// This is created by npm run build -> dist/index.cjs
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Import the built server (CommonJS bundle)
// The build process creates dist/index.cjs which includes everything
const serverPath = join(__dirname, "..", "dist", "index.cjs");

let app: any;

if (!existsSync(serverPath)) {
  console.error(`Server build not found at: ${serverPath}`);
  console.error("Current directory:", process.cwd());
  console.error("__dirname:", __dirname);
  
  // Fallback: create a minimal error handler
  const express = require("express");
  app = express();
  app.use((req: any, res: any) => {
    res.status(500).json({ 
      error: "Server build not found",
      message: "The built server file (dist/index.cjs) was not found. Make sure 'npm run build' completed successfully during deployment.",
      path: serverPath,
      cwd: process.cwd()
    });
  });
} else {
  try {
    const serverModule = require(serverPath);
    // The built server exports the app as default
    app = serverModule.default || serverModule;
    
    if (!app) {
      throw new Error("Built server module does not export an Express app");
    }
    
    console.log("Successfully loaded Express app from built server");
  } catch (error) {
    console.error("Error loading server:", error);
    // Fallback: create a minimal error handler
    const express = require("express");
    app = express();
    app.use((req: any, res: any) => {
      res.status(500).json({ 
        error: "Failed to load server",
        message: error instanceof Error ? error.message : String(error),
        path: serverPath
      });
    });
  }
}

export default app;
