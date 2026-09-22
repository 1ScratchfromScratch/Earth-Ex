# Earth-Ex

Earth-Ex now supports **Vercel deployment**. Vercel cannot see a local `media/movies` folder or persist files on its function filesystem, so the Vercel version stores the library metadata and uploaded movies in **Vercel Blob**.

## Deploy to Vercel

1. Import this repository into Vercel.
2. Create a Blob store in the Vercel dashboard and connect it to this project.
3. Add these environment variables:

   - `ADMIN_USERNAME` — your admin username
   - `ADMIN_PASSWORD` — a strong admin password
   - `AUTH_SECRET` — a long random string
   - `BLOB_READ_WRITE_TOKEN` — supplied by the connected Blob store

4. Redeploy and open your Vercel URL.

The admin can upload supported movies from the dashboard, edit metadata, and create viewer accounts. Viewers can only browse and play. The **Scan folder** button is retained for the Docker/local deployment; Vercel has no access to your computer's folders.

> Vercel serverless functions have request-size and execution limits. For very large movies, direct client-to-Blob uploads or a dedicated media host is recommended. The Docker deployment remains available for unrestricted local-folder scanning and large-file streaming.

## Local/Docker deployment

```bash
docker compose up -d --build
```

The default local admin is `admin` / `change-me-now`; change it before exposing the service.
