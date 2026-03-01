# BIC Field Reporter

A construction daily/weekly report tool built with React + Vite + Supabase.

## Current Status: In Development

### Completed
- [x] Header styling (light background, constrained text)
- [x] Removed Excel export button
- [x] Add Photo button supports file upload + camera
- [x] Voice Notes wired up with Web Speech API
- [x] Project scaffolded for Supabase + Netlify deployment
- [x] Dev server working (npm run dev)
- [x] **Blue Iron Logo** - Updated to use logo-blue.png in app header, inline SVG for PDFs
- [x] **Photo Descriptions** - Users can add descriptions when uploading photos
- [x] **PDF Export with Photos** - Daily & Weekly PDFs show photos with descriptions
- [x] **Weekly Reports on Dashboard** - Saved weekly reports appear on dashboard with view/edit/export
- [x] **Accessibility Audit** - Added focus styles, skip links, ARIA labels, ErrorBoundary
- [x] **Redesigned PDF Exports** - Professional styling with BIC branding

### Completed (Session: 2026-03-01)
- [x] **PDF Print Fix** - Rewrote print CSS to preserve grid/flex layouts with light theme instead of nuclear reset
- [x] **AI: Revise with AI** - Button on General Notes sends notes to OpenAI, returns HEADING — detail format, user can Accept/Edit
- [x] **AI: Project Q&A** - Search bar on Dashboard lets users ask natural language questions about the project
- [x] **Netlify Serverless Functions** - Two functions: `revise-notes.js` and `project-qa.js` using GPT-4o-mini

### Next Up
1. **GitHub + Netlify Deploy** - Push to GitHub, connect Netlify, add `OPENAI_API_KEY` env var
2. **Supabase** - Already configured in `.env.local`

### Roadmap (Future)
- User authentication

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Supabase (PostgreSQL + Storage)
- **Deployment**: Netlify

## Development
```bash
cd bic-field-reporter
npm install
npm run dev
```

## Deployment
1. Create Supabase project and run `supabase-schema.sql`
2. Copy `.env.example` to `.env.local` and add Supabase credentials
3. Deploy to Netlify (connect GitHub repo or manual deploy)

## Key Files
- `src/App.jsx` - Main app component (~2400 lines)
  - `exportDailyPDF` function: ~line 495
  - `exportWeeklyPDF` function: ~line 639
- `src/db.js` - Supabase data layer
- `src/supabase.js` - Supabase client config
- `supabase-schema.sql` - Database schema
- `public/logo-blue.png` - Blue Iron logo
