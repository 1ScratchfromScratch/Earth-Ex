# Earth-Ex

A private Plex-style movie server. The administrator uploads/scans movies and edits metadata; viewer accounts can only browse and play.

## Start

```bash
docker compose up -d --build
```

Open http://localhost:3000. Change `ADMIN_PASSWORD` in `docker-compose.yml` before exposing the service. Movies may be uploaded in the admin dashboard or placed in `media/movies`, then indexed with **Scan folder**. Supported formats: mp4, webm, mkv, avi, mov, and m4v.

Movie files are kept outside the public web directory. Only authenticated users can stream them; only the admin can upload, scan, edit metadata, and create viewer accounts.
