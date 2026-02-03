import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // For Vercel, use process.cwd(), for regular server use __dirname
  const basePath = process.env.VERCEL ? process.cwd() : __dirname;
  const distPath = path.resolve(basePath, "dist", "public");
  
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve static files with proper content types
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
      }
    }
  }));

  // fall through to index.html if the file doesn't exist
  // This should be last, after all API routes
  app.get("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.sendFile(indexPath);
  });
}
