# Deployment

This app is a full-stack Next.js marketplace. It needs a runtime server, a database, and persistent storage for uploaded listing photos. GitHub Pages is not enough for the live app.

## Recommended beginner setup: Railway

Railway can deploy the app from GitHub and provide a custom domain. Use a persistent volume so SQLite and uploads survive redeploys.

### 1. Push the project to GitHub

Create a GitHub repository and push this project to it.

### 2. Create the Railway project

1. Go to Railway.
2. Create a new project.
3. Choose deployment from a GitHub repository.
4. Select this repository.

### 3. Add a persistent volume

Attach a volume to the web service and mount it at:

```txt
/data
```

### 4. Set environment variables

Set these variables on the Railway service:

```txt
DATABASE_URL=file:/data/prod.db
UPLOAD_DIR=/data/uploads
AUTH_SECRET=<a-long-random-secret>
```

Generate `AUTH_SECRET` locally with:

```bash
node -e "console.log(crypto.randomUUID() + crypto.randomUUID())"
```

### 5. Build and start commands

Railway should usually detect the app automatically. If it asks:

```txt
Build command: npm run build
Start command: npm run start
```

### 6. Connect flz.works

1. In Railway, open the service settings.
2. Add custom domains for `flz.works` and `www.flz.works`.
3. Railway will show DNS records, usually a `CNAME` plus a `TXT` verification record.
4. In Name.com, open `flz.works` -> Manage DNS Records.
5. Add the records Railway gives you exactly.
6. Wait for verification and SSL.

Do not buy extra Name.com hosting, website builder, email, or SSL for this app unless you specifically need those products.
