# SyncFavoritesServer

Self-hosted bookmark sync server for the [SyncFav browser extension](https://github.com/jfondrix/Syncfavorites).

Stores your bookmarks as a JSON file on your own VPS. All requests are protected by a secret token you choose.

---

## Setup

```bash
git clone https://github.com/jfondrix/SyncFavoritesServer.git /opt/syncfav
cd /opt/syncfav
npm install
```

Start:

```bash
SYNC_TOKEN=your-secret-token PORT=3001 node syncfavserver.js
```

For full setup instructions including Nginx, SSL, and systemd, see the [extension README](https://github.com/jfondrix/Syncfavorites).

---

## API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | None | Health check |
| GET | `/privacy` | None | Privacy policy page |
| GET | `/bookmarks` | Bearer token | Retrieve bookmarks |
| PUT | `/bookmarks` | Bearer token | Upload bookmarks |

---

## License

MIT
