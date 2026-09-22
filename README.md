# Earth-Ex

Earth-Ex is a self-hosted website for a private movie library. It runs as a normal Node.js website—no Vercel services, Blob storage, or database service are required.

## Run it

```bash
npm start
```

Open <http://localhost:3000>.

The first administrator is created from these environment variables:

```bash
ADMIN_USERNAME=admin ADMIN_PASSWORD=change-me-now npm start
```

Change the password before sharing the site. Docker is also supported:

```bash
docker compose up -d --build
```

## Add movies

- Upload a video in the administrator dashboard, or put it in `media/movies`.
- Click **Scan movie folder** after placing files manually.
- Edit title, year, genre, description, and poster URL from the admin dashboard.

Supported video extensions are MP4, WebM, MKV, AVI, MOV, and M4V. Metadata is stored in `data/library.json`; movies remain in `media/movies`.

Only the administrator can upload, scan, edit metadata, and create viewer accounts. Viewer accounts can only browse and play movies.
