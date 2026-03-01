# BIC Field Reporter

Construction daily & weekly reporting app. Internal tool — no authentication required.

---

## Quick Start: Deploy in 3 Steps

### Step 1: Supabase Setup
1. Go to [supabase.com](https://supabase.com) and open your project (or create one)
2. Go to **SQL Editor** (left sidebar)
3. Paste the contents of `supabase-schema.sql` and click **Run**
4. Go to **Settings → API** and copy your:
   - **Project URL** (looks like `https://abc123.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

### Step 2: Local Setup
```bash
cd bic-field-reporter
npm install

# Create your .env.local file
cp .env.example .env.local
# Edit .env.local with your Supabase URL and key

npm run dev
```
Open http://localhost:5173 — you should see the app with an empty project list.

### Step 3: Deploy to Netlify
**Option A: GitHub (recommended)**
1. Push this folder to a GitHub repo
2. In Netlify: **Add new site → Import from Git → select the repo**
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables in **Site settings → Environment variables**:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
6. Trigger a redeploy

**Option B: Manual deploy**
```bash
npm run build
# Drag the `dist` folder into Netlify's deploy area
```
Then add the environment variables in Netlify and redeploy.

---

## Project Structure
```
src/
  main.jsx       — Entry point
  App.jsx        — All UI components + state management
  supabase.js    — Supabase client initialization
  db.js          — Database CRUD functions (projects, reports, photos)
```

## Environment Variables
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```
