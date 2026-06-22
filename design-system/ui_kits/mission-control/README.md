# Mission Control — Operator Console UI kit

The **solo-operator command center**. VenuePlus is designed to be run by one person supervising an 8-agent fleet (Discovery, Enrichment, Scoring, Outreach, SEO, Social, Email Campaign, Workflow Monitor). The agents do the growth and ops work; the operator only steps in to approve high-risk actions. Core principle from `venueplus-agents`: **nothing sends or posts without operator approval.**

## Screens (one interactive app — `index.html`)
- **Overview** — KPI grid (GMV, venues, providers, escalations, fleet status), the fleet **kill switch**, and supply / demand / liquidity summaries.
- **Agents** — dispatch a goal in plain English ("Grow venue supply in Austin"); the planner fans it across the fleet. Live fleet status cards (done / needs-approval / blocked).
- **Runs** — table of agent runs; click any row for the full **audit trace** (jobs → actions, each with a risk tier, policy decision, and whether it executed).
- **Escalations** — the **approval queue**. Each card shows the tool, risk badge, agent, reason, and args. Money-movement and legal actions are hard-gated.

## Built from
- `Badge` (risk / decision / run-status), `KpiCard`, `Card`, `Button`, `Avatar` from the design system.
- Risk tiers: read → internal_write → outbound → financial → money_movement → legal.
- Decisions: auto · require_approval · deny.

## Files
`index.html` · `data.js` (simulated fleet) · `Shell.jsx` (header + nav) · `Overview.jsx` · `Agents.jsx` · `Runs.jsx` · `Escalations.jsx` · `App.jsx`

Recreated from `frontend/app/admin/*` (Mission Control) and `venueplus-agents/` in the source repo.
