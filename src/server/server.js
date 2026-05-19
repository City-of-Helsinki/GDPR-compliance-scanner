import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { runScan } from './scanApi.js';

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "cdnjs.cloudflare.com",
        "cdn.jsdelivr.net"
      ],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Disable X-Powered-By header
app.disable('x-powered-by');

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// One-off scan endpoint (SSE)
app.get('/api/scan', async (req, res) => {
  const { pageUrl, apiUrl, variants: variantsParam } = req.query;

  if (!pageUrl || !apiUrl || !variantsParam) {
    return res.status(400).json({ error: 'Missing required parameters: pageUrl, apiUrl, variants' });
  }

  try {
    new URL(pageUrl);
    new URL(apiUrl);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const ALLOWED_VARIANTS = new Set(['none', 'required', 'all']);
  const variants = variantsParam.split(',').map(v => v.trim()).filter(v => ALLOWED_VARIANTS.has(v));

  if (variants.length === 0) {
    return res.status(400).json({ error: 'No valid variants specified (use: none, required, all)' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = (type, data) => {
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  };

  try {
    await runScan(pageUrl, apiUrl, variants, send);
    send('done', { message: 'Scan completed.' });
  } catch (error) {
    send('error', { message: error.message || 'An unexpected error occurred.' });
  } finally {
    res.end();
  }
});

// Serve static files from the 'reports' directory with security options
app.use(express.static(path.join(__dirname, '../../reports'), {
  dotfiles: 'deny',  // Deny access to dotfiles
  maxAge: '1d',      // Cache static assets for 1 day
  index: false       // Disable directory indexing
}));

// Default to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../reports', 'index.html'), {
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  });
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running at http://localhost:${port}`);
});
