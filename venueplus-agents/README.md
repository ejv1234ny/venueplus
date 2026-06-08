# venueplus-agents

Phase 1 human-in-the-loop AI agent system for VenuePlus.

8 agents feed a central review queue. **Nothing sends or posts without admin approval.**

## Agents
1. **Discovery** — Google Places + Yelp lead scraping
2. **Enrichment** — Hunter.io + social profile detection
3. **Scoring** — 0-100 ranking with auto-queue >=60
4. **Outreach Draft** — Claude-generated personalized emails
5. **SEO Content** — Venue listing pages + blog posts
6. **Social Media Draft** — FB/IG post drafts
7. **Email Campaign** — Drip sequences (venue/provider/renter)
8. **Workflow Monitor** — Hourly anomaly detection

## Architecture
- **Service:** FastAPI on Railway (separate from VenuePlus backend)
- **DB:** Supabase `venueplus` schema (shared with app)
- **Auth:** `AGENTS_SECRET` Bearer token on every endpoint
- **Dashboard:** `/admin/agents/*` in the main Next.js frontend, proxies through the VenuePlus backend

## Build status
- [x] Step 1 — Supabase migration (`migrations/001_phase1_tables.sql`)
- [ ] Step 2 — FastAPI scaffold
- [ ] Step 3 — services/ wrappers
- [ ] Step 4-11 — agents
- [ ] Step 12 — main.py + Railway cron
- [ ] Step 13 — Review queue dashboard
- [ ] Step 14 — End-to-end test

## Running locally (sim mode, no keys required)
```
cd venueplus-agents
pip install -r requirements.txt
uvicorn main:app --port 8001
```

All external services (Google, Yelp, Hunter, Anthropic, Resend) fall
back to deterministic in-memory simulators when their API keys are
unset, so the full pipeline runs end-to-end with zero keys.
