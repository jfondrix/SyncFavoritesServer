const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app   = express();
const PORT  = process.env.PORT       || 3000;
const TOKEN = process.env.SYNC_TOKEN;
const DATA_DIR = path.join(__dirname, 'profiles');

if (!TOKEN) {
  console.error('ERROR: SYNC_TOKEN environment variable is not set.');
  process.exit(1);
}

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

app.use(express.json({ limit: '10mb' }));

// Public routes
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/privacy', (_req, res) => {
  res.sendFile(path.join(__dirname, 'privacy.html'));
});

// Auth middleware
app.use((req, res, next) => {
  const auth  = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

function profileFile(profile) {
  // sanitize: only allow alphanumeric, dash, underscore
  const safe = profile.replace(/[^a-z0-9-_]/gi, '').toLowerCase() || 'default';
  return path.join(DATA_DIR, `${safe}.json`);
}

// GET /bookmarks/:profile
app.get('/bookmarks/:profile', (req, res) => {
  const file = profileFile(req.params.profile);
  if (!fs.existsSync(file)) {
    return res.json({ bookmarks: [] });
  }
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to read bookmarks file.' });
  }
});

// PUT /bookmarks/:profile
app.put('/bookmarks/:profile', (req, res) => {
  const { bookmarks } = req.body;
  if (!bookmarks || !Array.isArray(bookmarks)) {
    return res.status(400).json({ error: 'Invalid payload: expected { bookmarks: [] }' });
  }
  try {
    const file = profileFile(req.params.profile);
    const payload = { bookmarks, updatedAt: new Date().toISOString() };
    fs.writeFileSync(file, JSON.stringify(payload, null, 2), 'utf8');
    res.json({ ok: true, profile: req.params.profile, updatedAt: payload.updatedAt });
  } catch {
    res.status(500).json({ error: 'Failed to write bookmarks file.' });
  }
});

app.listen(PORT, () => {
  console.log(`SyncFav server running on port ${PORT}`);
});
