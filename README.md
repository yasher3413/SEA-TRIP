# Yash's SEA Trip Site 🌏

A live travel companion website for Yash's 29-day Southeast Asia backpacking trip (Apr 23 – May 21, 2026). Built for his parents to follow along — AI chatbot at the center, with interactive map, timeline, expenses, and more.

## Local Dev

```bash
cp .env.local.example .env.local
# Fill in your env vars (see below)

npm install
npm run dev
# → http://localhost:3000
```

## Env Vars

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API key from console.anthropic.com |
| `EXA_API_KEY` | Exa web search key from exa.ai |
| `GITHUB_TOKEN` | Fine-grained PAT with `contents:write` on this repo |
| `GITHUB_REPO` | `username/repo-name` (e.g. `yasher3413/sea-trip-site`) |
| `GITHUB_BRANCH` | Usually `main` |
| `ADMIN_PASSWORD` | Password for `/admin` page — you choose |
| `NEXT_PUBLIC_SITE_NAME` | Displayed in browser tab |

## How the GitHub write flow works

1. You upload a receipt or edit data on `/admin`
2. The app calls `/api/admin/save` which uses the GitHub Contents API (Octokit) to commit the updated JSON directly to the repo
3. Vercel detects the push and triggers a new deployment (~60 seconds)
4. Parents see live data

**Why GitHub commits, not a database:** Zero DB setup, free, every expense is version-controlled and auditable in git history. If you ever want to revert, just `git revert`.

## How to add a new expense manually

1. Go to `/admin` → enter password
2. Either upload a receipt photo (Claude Vision extracts the fields) or use the Data Editor, select `expenses.json`, and append to the `log` array
3. Hit "Commit to GitHub"

## How to add a new day / flight / hostel

1. Go to `/admin` → Data Editor
2. Select the relevant JSON file
3. Edit the JSON directly (it validates syntax before committing)
4. Commit

## Changing colors / fonts

- **Colors:** Edit CSS variables in `app/globals.css` — `--teal`, `--coral`, `--cream`, etc.
- **Fonts:** Swap the Google Fonts import in `globals.css`. Update `--font-sans` and `--font-accent` in the `@theme` block.

## Security notes

- **Never commit `.env.local`** — it's in `.gitignore`
- The `/admin` page is protected by a cookie-based session. Password is compared server-side only and never exposed to the browser.
- The GitHub PAT should be fine-grained with the minimum scope: `contents:write` on this repo only.
- `GITHUB_TOKEN` is only used server-side in API routes.

## Tech stack

- **Framework:** Next.js 15 (App Router), TypeScript
- **Styling:** Tailwind CSS v4, Framer Motion
- **LLM:** Anthropic Claude Sonnet — streaming responses, vision for receipt OCR, Exa tool use for live web search
- **Web search:** Exa (`exa-js`) — called as an Anthropic tool when trip JSON can't answer a question
- **Map:** Leaflet + react-leaflet (OpenStreetMap tiles, no API key needed)
- **Charts:** Recharts (donut, bar, line)
- **Data persistence:** JSON files in `/data/`, edited via GitHub Contents API from serverless routes
- **Admin auth:** Cookie session, single password, no user accounts needed

## Deploy to Vercel

1. Push this repo to GitHub
2. Import in Vercel dashboard → select repo
3. Add all env vars from `.env.local.example` in Vercel project settings
4. Deploy — Vercel auto-deploys on every GitHub push (including data edits from `/admin`)
