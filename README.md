# JOKERZ — Setup Guide

## 1. Initialize project

```bash
# In the jokerz folder, install dependencies
npm install

# Also install dotenv for the db setup script
npm install dotenv --save-dev
```

## 2. Neon Database

1. Go to [neon.tech](https://neon.tech) and create a free project
2. Create a database called `jokerz`
3. Copy your connection string

## 3. Environment variables

```bash
# Create .env from the example
cp .env.example .env
```

Edit `.env` with your actual values:
- `DATABASE_URL` — your Neon connection string
- `VITE_X_PROFILE` — your X profile URL
- `VITE_X_POST` — the specific post URL for like/RT/comment/quote tasks
- `VITE_SITE_URL` — your deployed site URL (for referral links)

## 4. Setup database

```bash
node scripts/setup-db.mjs
```

This creates the `submissions` table with all needed columns and indexes.

## 5. Local development

```bash
# Install Netlify CLI if you don't have it
npm install -g netlify-cli

# Run with Netlify dev (handles both Vite + serverless functions)
netlify dev
```

This starts the dev server at `http://localhost:8888` with both the frontend and API functions working.

## 6. Deploy to Netlify

```bash
# Link to Netlify (first time)
netlify init

# Set env vars in Netlify dashboard:
# - DATABASE_URL
# - VITE_X_PROFILE
# - VITE_X_POST
# - VITE_SITE_URL

# Deploy
netlify deploy --prod
```

Or just connect your GitHub repo to Netlify for auto-deploys.

## 7. Add your art

In `src/pages/Home.tsx`, replace the placeholder `ArtGrid` component's color divs with actual `<img>` tags pointing to your NFT art files. Drop them in the `public/` folder.

Example:
```tsx
<img src="/art/joker-01.png" alt="Joker #001" className="w-full h-full object-cover" />
```

## Project structure

```
jokerz/
├── netlify/functions/      # Serverless API
│   ├── submit.ts           # POST /api/submit
│   └── entries.ts          # GET /api/entries
├── scripts/
│   └── setup-db.mjs        # Database migration
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   └── Toast.tsx
│   ├── hooks/
│   │   ├── useReferral.ts
│   │   └── useToast.ts
│   ├── pages/
│   │   ├── Home.tsx        # Landing page
│   │   ├── Apply.tsx       # Whitelist form
│   │   └── Check.tsx       # Wallet checker
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css           # Tailwind v4 + custom styles
│   └── vite-env.d.ts
├── netlify.toml
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Whitelist management

To whitelist users, run this against your Neon database:

```sql
-- Whitelist a specific user
UPDATE submissions SET is_whitelisted = true WHERE x_username = 'username';

-- Whitelist top N referrers
UPDATE submissions SET is_whitelisted = true
WHERE id IN (
  SELECT id FROM submissions ORDER BY ref_points DESC LIMIT 50
);
```
