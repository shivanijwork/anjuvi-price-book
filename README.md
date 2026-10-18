# Anjuvi Price Book

Suit pricing app for mummy: photo, CP, retail SP, online SP, profit and margin for every suit, with a form to add new ones.

- `public/index.html` – the whole page (no build step)
- `api/suits.js` – list / add / edit / delete suits (Neon Postgres)
- `api/upload.js` – saves new suit photos to Vercel Blob
- `api/login.js` – one shared password, kept in a cookie for a year
- `schema.sql` – run once in Neon to create the table and add the first 14 suits

## Setup (one time)

1. **Neon** → SQL Editor → paste `schema.sql` → Run.
2. **Push this folder** to `github.com/shivanijwork/anjuvi-price-book`.
3. **Vercel** → Add New → Project → import the repo → Framework preset: **Other** → Deploy.
4. **Vercel project → Storage → Create → Blob** → connect it to this project.
   (This adds `BLOB_READ_WRITE_TOKEN` automatically.)
5. **Vercel project → Settings → Environment Variables**, add:
   - `DATABASE_URL` = Neon connection string (pooled)
   - `APP_PASSWORD` = the password mummy will type
6. **Deployments → Redeploy** so the variables take effect.

Changing `APP_PASSWORD` later logs everyone out.

## Phone

Open the site in Chrome → menu ⋮ → **Add to Home screen**. Log in once; the phone stays logged in.
