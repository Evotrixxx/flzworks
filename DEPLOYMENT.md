# Deployment

This app is a full-stack Next.js marketplace. It needs a runtime server, a database, and persistent storage for uploaded listing photos. GitHub Pages is not enough for the live app.

## Recommended beginner setup: Railway

Railway can deploy the app from GitHub and provide a custom domain. Production storage is a managed PostgreSQL database plus S3-compatible object storage — both survive redeploys without a mounted volume.

### 1. Push the project to GitHub

Create a GitHub repository and push this project to it.

### 2. Create the Railway project

1. Go to Railway.
2. Create a new project.
3. Choose deployment from a GitHub repository.
4. Select this repository.
5. Add a Railway PostgreSQL database to the project and copy its `DATABASE_URL`.
6. Add a Railway Bucket (or any S3-compatible object storage) for uploaded photos and note the bucket name, endpoint, region, and access keys.

### 3. Set environment variables

Set these variables on the Railway web service:

```txt
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<database>
S3_BUCKET=<bucket-name>
S3_ENDPOINT=https://storage.railway.app
S3_REGION=auto
S3_ACCESS_KEY_ID=<access-key-id>
S3_SECRET_ACCESS_KEY=<secret-access-key>
AUTH_SECRET=<a-long-random-secret>
APP_BASE_URL=https://www.flz.works
INTRANET_ACCESS_SECRET=<another-long-random-secret>
INTRANET_HOST_EMAIL=floszbeni@gmail.com
RESEND_API_KEY=<resend-api-key>
RESEND_FROM=FLZ Works <noreply@flz.works>
GMAIL_SMTP_USER=<gmail-address>
GMAIL_SMTP_APP_PASSWORD=<gmail-app-password>
GMAIL_SMTP_FROM=<gmail-address>
INSTAGRAM_ACCESS_TOKEN=<meta-instagram-token>
INSTAGRAM_USER_ID=<instagram-user-id-or-me>
INSTAGRAM_API_VERSION=v23.0
TIKTOK_CLIENT_KEY=<tiktok-developer-client-key>
TIKTOK_CLIENT_SECRET=<tiktok-developer-client-secret>
TIKTOK_REFRESH_TOKEN=<tiktok-user-refresh-token-with-video.list>
SOCIAL_SYNC_SECRET=<another-long-random-secret>
NEXT_PUBLIC_SOCIAL_INSTAGRAM=<instagram-profile-url>
NEXT_PUBLIC_SOCIAL_FACEBOOK=<facebook-profile-url>
NEXT_PUBLIC_SOCIAL_PINTEREST=<pinterest-profile-url>
```

Instagram auto-import requires a Professional (Creator or Business) account and an API token
that can read that account's media. TikTok auto-import requires an approved Login Kit + Display
API app, the `video.list` scope, and the refresh token returned when `@vision.flz` authorizes it.
The refresh token is rotated and stored server-side in the persistent database; it is never sent
to the browser.

### 4. Schedule social posts to become projects

Create a second Railway service from the same repository and set its start command to:

```txt
npm run social:sync
```

Give that service the same `APP_BASE_URL` and `SOCIAL_SYNC_SECRET` values as the web service,
then set its Cron Schedule to `0 */12 * * *` (every 12 hours, UTC). It calls the protected sync
endpoint and exits. The first successful run imports all historical media returned by each API;
later runs update existing project cards and add only new posts.

The app refuses to start in production unless `DATABASE_URL` points to PostgreSQL and all five `S3_*` variables are set. This prevents Railway from silently running production against a non-persistent SQLite file on ephemeral storage.

Generate `AUTH_SECRET` locally with:

```bash
node -e "console.log(crypto.randomUUID() + crypto.randomUUID())"
```

Railway Free, Trial, and Hobby plans do not allow SMTP email delivery. Use `RESEND_API_KEY` and `RESEND_FROM` for the intranet approval emails on those plans. The Gmail SMTP variables are only a fallback for hosts or Railway plans where outbound SMTP is available.

### 5. Migrate existing data (only if upgrading from the old SQLite setup)

If this deployment previously ran on SQLite with a mounted `/data` volume, move the existing rows into PostgreSQL before switching the web service over:

1. Locally, with the old SQLite file still available, run:
   ```bash
   node scripts/export-sqlite-data.mjs --db /path/to/prod.db --out prisma/sqlite-export.json
   ```
2. Point `DATABASE_URL` at the new PostgreSQL database and create its schema:
   ```bash
   npx prisma migrate deploy
   ```
3. Import and verify the exported rows (safe to re-run — existing rows are skipped, not duplicated):
   ```bash
   npm run migration:import-postgres
   ```
4. Upload and checksum-verify the old media files, preserving their filenames as object keys:
   ```bash
   npm run migration:upload-media -- --dir /path/to/uploads
   ```
   Existing listing and Studio URLs (`/media/<filename>`) will keep resolving.

`prisma/sqlite-export.json` contains password hashes and user emails — never commit it (already gitignored) and delete it once the import succeeds.

### 6. Build and start commands

Railway should usually detect the app automatically. If it asks:

```txt
Build command: npm run build
Start command: npm run start
```

### 7. Connect flz.works

1. In Railway, open the service settings.
2. Add custom domains for `flz.works` and `www.flz.works`.
3. Railway will show DNS records, usually a `CNAME` plus a `TXT` verification record.
4. In Name.com, open `flz.works` -> Manage DNS Records.
5. Add the records Railway gives you exactly.
6. Wait for verification and SSL.

Do not buy extra Name.com hosting, website builder, email, or SSL for this app unless you specifically need those products.

## Back up listing data

Sellers can download listing text from the dashboard:

- Use `Download text` on one listing to save a reusable `.txt` template.
- Use `Download all` to export all of your listings into one text file separated by `---`.
- Upload a `.txt` file on the single-listing sell form to prefill a new listing without creating it immediately.
