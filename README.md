# Sentinel AI

## Deploy on Vercel

This repository keeps the Next.js app under `frontend/`.

### One-time setup

1. Install the Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Log in:
   ```bash
   vercel login
   ```
3. Link the project to this repo (from repository root):
   ```bash
   vercel link --cwd frontend
   ```

### Preview deployment

```bash
vercel --cwd frontend
```

### Production deployment

```bash
vercel --prod --cwd frontend
```

### CI deployment (token based)

```bash
vercel --prod --cwd frontend --token "$VERCEL_TOKEN"
```

> If you import this repo in the Vercel dashboard instead of CLI, set the **Root Directory** to `frontend`.
