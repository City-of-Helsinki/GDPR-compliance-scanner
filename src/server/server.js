import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'reports' directory
app.use(express.static(path.join(__dirname, '../../reports')));

// Default to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../reports', 'index.html'));
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running at http://localhost:${port}`);
});
