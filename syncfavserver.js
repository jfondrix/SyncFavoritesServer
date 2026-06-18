const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app   = express();
const PORT  = process.env.PORT       || 3000;
const TOKEN = process.env.SYNC_TOKEN;
const DATA_FILE = path.join(__dirname, 'bookmarks.json');

if (!TOKEN) {
  console.error('ERROR: SYNC_TOKEN environment variable is not set.');
  process.exit(1);
}

app.use(express.json({ limit: '10mb' }));

// Public health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Auth middleware for all routes below
app.use((req, res, next) => {
  const auth  = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// GET /bookmarks — return stored bookmarks
app.get('/bookmarks', (_req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    return res.json({ bookmarks: [] });
  }
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to read bookmarks file.' });
  }
});

// PUT /bookmarks — overwrite stored bookmarks
app.put('/bookmarks', (req, res) => {
  const { bookmarks } = req.body;
  if (!bookmarks || !Array.isArray(bookmarks)) {
    return res.status(400).json({ error: 'Invalid payload: expected { bookmarks: [] }' });
  }
  try {
    const payload = { bookmarks, updatedAt: new Date().toISOString() };
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf8');
    res.json({ ok: true, updatedAt: payload.updatedAt });
  } catch {
    res.status(500).json({ error: 'Failed to write bookmarks file.' });
  }
});

app.listen(PORT, () => {
  console.log(`SyncFav server running on port ${PORT}`);
});
