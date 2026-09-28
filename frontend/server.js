import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Health check endpoint for Cloud Run and container orchestrators
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/_health', (_req, res) => {
  res.status(200).send('OK');
});

// Serve static assets from built Vite client dist
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback: any non-asset route serves index.html
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('*', (_req, res) => {
    res.status(200).send('Crewmate application server is online. Please run npm run build to populate static assets.');
  });
}

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Crewmate Server] Listening on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'production'} mode`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
