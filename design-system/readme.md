# VenuePlus Design System

**VenuePlus** is an event-booking marketplace where commercial spaces lease out **by the hour** and renters book the venue *plus* every essential service — cleaning, security, food trucks, insurance, DJs — in a single transaction. Think "Airbnb for events + TaskRabbit for services."

The defining trait: **VenuePlus is built to be run by a solo operator backed by an autonomous AI agent fleet.** An 8-agent system (Discovery, Enrichment, Scoring, Outreach, SEO, Social, Email Campaign, Workflow Monitor) handles supply growth, demand generation, and operations. A human operator supervises from a **Mission Control** console and only intervenes to approve high-risk actions — *nothing sends, posts, or moves money without explicit approval.* This design system serves **both** surfaces: the consumer marketplace and the operator console.

## Sources
This system was reverse-engineered from the product codebase. The reader is encouraged to explore it further to build higher-fidelity designs:

- **GitHub:** `ejv1234ny/venueplus` (private) — Next.js 14 frontend (`frontend/`), FastAPI backend (`backend/`), React Native app (`mobile/`), and the agent fleet (`venueplus-agents/`).
  - `frontend/tailwind.config.js` — color palette (verbatim source of our tokens)
  - `frontend/app/page.tsx`, `frontend/app/venues/` — the marketplace
  - `frontend/app/admin/*` + `venueplus-agents/README.md` — Mission Control & the agent fleet

Access requires permission on the private repo; values are captured here so this system stands alone.

---

## Brand positioning & content fundamentals

**Vibe:** trustworthy, versatile, welcoming. Professional enough to move money and sign contracts, friendly enough for a 25-kid birthday party. The navy says "safe and reliable"; the orange says "celebration."

**Voice & copy:**
- **Second person, active, benefit-first.** "Find your perfect event space." "Turn your unused space into income." "List your space & earn."
- **Sentence case** everywhere — headings, buttons, labels. Not Title Case, not ALL CAPS (except tiny overline labels and risk badges like `MANDATORY`).
- **Short and concrete.** Real nouns: rooftops, fields, parking lots, pool houses, food trucks. Real use-cases: "romantic rooftop picnic," "classic car show at an airfield."
- **Plain-language CTAs:** "Search," "Book Now," "Browse Venues," "Sign up free," "Become a Host," "Run goal," "Approve," "Reject."
- **Operator-side copy is calm and precise** — it reports facts and asks for a decision: "2 escalations awaiting your approval," "Hard-gated money-movement action — requires explicit confirmation."
- **Emoji:** the marketing site used a few category emoji (🏙️🌾🎧) in the original; this system **replaces them with typographic/icon treatments** and reserves emoji for at most the occasional success/empty state ("🎉 No open escalations"). Don't build UI on emoji.
- **Punctuation:** em-dashes for asides, "+" as shorthand for "plus" (the brand is literally Venue**Plus**).

---

## Visual foundations

**Color.** Two-brand system over a neutral gray scale:
- **Primary — Brand Navy `#1b5390`** (`--primary-500`): trust, reliability, navigation, links, primary buttons, prices. Sampled from the logo's navy "V".
- **Accent — Brand Orange `#e0561f`** (`--accent-500`): the celebration color, reserved for the single highest-intent CTA per view (e.g. "Book Now"). Sampled from the logo's orange "+". Use sparingly.
- **Neutrals** (Tailwind gray): `--neutral-50` app background, white cards, `--neutral-900` headings, `--neutral-600` body, `--neutral-500/400` meta.
- **Status** (booking/job): yellow pending · green confirmed · blue completed · red cancelled.
- **Service categories** each own a soft chip color (cleaning=green, security=red, dj=pink, photography=blue, …).
- **Agent risk tiers** (Mission Control), escalating severity: `read` gray → `internal_write` sky → `outbound` amber → `financial` orange → `money_movement` red → `legal` purple. **Decisions:** auto=green, require_approval=amber, deny=red.

**Gradients.** One signature gradient: **navy→orange** — the logo's own gradient (`--gradient-hero` for marketing hero sections; `--gradient-brand` for avatar fallbacks). No other gradients — never bluish-purple. The operator console uses **flat** surfaces, no gradients.

**Type.** **Inter** for everything, weights 300–800. Headings bold/extrabold with tight tracking (`-0.02em`); body regular at 16px / 1.5–1.65; meta 14px in `--neutral-500`; overlines & badges 12px semibold. Hero scales to 48–60px.

**Spacing & layout.** 4px base scale. Content maxes at **1280px** (`max-w-7xl`) on marketing/marketplace and **~1100px** on the console, centered with 24px gutters. Generous vertical section rhythm (56–80px) on marketing; denser (16–24px) in the console.

**Corners.** Buttons & inputs `rounded-lg` (8px); cards & panels `rounded-xl` (12px); media `rounded-2xl` (16px); badges, pills, avatars, and the hero search bar fully rounded.

**Cards.** White, `rounded-xl`, **soft neutral shadow** (`--shadow-sm` at rest). Interactive listing cards **lift on hover** to `--shadow-md` and translate up 2px. Operator console cards instead use a **1px `--neutral-200` border with no shadow** — flatter, more data-dense. No colored left-border accent cards.

**Shadows.** Soft, neutral, never tinted. `sm` resting card → `md` hover → `lg/xl` floating panels → `2xl` the hero search bar.

**Borders.** Hairline `--neutral-100` for in-card dividers; `--neutral-200` default; `--neutral-300` on inputs; **2px** for outline buttons and focus.

**Motion.** Quick and restrained: 200ms `ease` color/shadow fades on hover, 300ms image scale on card-image hover, a 2px card lift. Buttons darken one step on hover (navy 500→600, orange 500→600). No bounces, no big entrances, no infinite loops. Focus shows a navy ring.

**States.** Hover = darker brand step or card lift. Press/disabled = 50% opacity, `not-allowed`. Inputs focus to a navy border + soft navy ring. Destructive/financial actions in the console use red and a confirm step.

**Imagery.** Real venue photos when available; otherwise the **navy→orange gradient block with a faded "V+"** — the product's authentic empty-photo state. Warm, bright, celebratory crops. No stock-y filters.

---

## Iconography

The product uses **Feather icons** via `react-icons/fi` (`FiSearch`, `FiMapPin`, `FiUsers`, `FiDollarSign`, `FiCalendar`, `FiCheckCircle`, `FiShield`, `FiStar`, `FiX`, `FiPlus`, `FiChevronDown`…) — thin **2px line icons, rounded caps**, no fills.

- **For new work, use [Lucide](https://lucide.dev) from CDN** — the maintained successor to Feather, visually identical (same names, 2px rounded strokes). This is a deliberate, near-exact substitution; flag it if pixel-exact Feather is required.
  ```html
  <script src="https://unpkg.com/lucide@latest"></script>
  <script>lucide.createIcons();</script>
  ```
- Keep icons at the text color and ~14–24px. Pair with a label; don't rely on icon-only controls except for clear affordances (close ×, chevrons, stepper ±).
- **No emoji as UI icons.** A single ✓ or × glyph for confirm states is fine.
- **Logo:** the **V+ mark** — a navy "V" + orange "+" inside a navy→orange swoosh — beside the "VenuePlus" wordmark (navy "Venue" + orange "Plus") and tagline "More Venues. More Possibilities." Real PNG assets ship in `assets/venueplus-logo-full.png` (full lockup) and `assets/venueplus-logo-mark.png` (mark only). See `guidelines/brand-logo.html`. No standalone logo file ships in the repo — this is the codebase's live logo, reproduced from markup.

---

## Index — what's in this system

**Foundations / tokens** (`styles.css` → `tokens/`)
- `tokens/colors.css` — primary, accent, neutral scales; status, category, **risk & decision** colors; semantic aliases; gradients.
- `tokens/typography.css` — Inter scale, weights, line-heights.
- `tokens/spacing.css` — 4px spacing scale + layout widths.
- `tokens/effects.css` — radii, shadows, borders, motion.
- `tokens/fonts.css` — Inter (Google Fonts; see Caveats).

**Components** (`components/`) — import from `window.VenuePlusDesignSystem_17f1a7`
- `core/` — `Button`, `Input`, `Select`, `Checkbox`, `Badge`, `Card`, `Avatar`, `Tabs`
- `operator/` — `KpiCard` (Mission Control metric tile)

**UI kits** (`ui_kits/`)
- `mission-control/` — the solo-operator console (Overview · Agents · Runs · Escalations · **Settings**). **The centerpiece.** The Settings tab gives per-agent autonomy controls — set each action to Auto / Approval / Off, with money & legal actions permanently hard-gated, plus thresholds (lead-score bar, daily send caps, SLA) and Conservative / Balanced / Max-autonomy presets.
- `mobile-operator/` — the on-the-go operator app (iOS): a phone-sized approval queue to clear escalations, a home dashboard with the fleet kill switch, and a fleet status list. Reuses the console's data and the Badge component.
- `notifications/` — how the fleet reaches you: an iOS **lock screen** with approval pings (money/legal flagged critical) and a **notification-settings** screen with per-risk delivery rules (Push / Digest / Silent) and quiet hours that critical alerts always break through.
- `operator-launch/` — the **day-one empty state** for a brand-new operator (zero supply). Explains the bootstrap strategy — **scrape service providers first** (easy-to-find SMBs with ad channels), and **venues follow** because the services they'd require from renters are already in place — then launches the supply engine and shows the provider pipeline, coverage-by-category filling, and Phase 2 (venue recruitment) unlocking at 60% coverage.
- `finance/` — **escrow & multi-party payouts**. A renter's payment (venue + selected services + platform fee) is **held in escrow** on booking; after the event and a dispute window it's **released** to the host, each service provider, and the platform. Role-switchable dashboards (Operator / Host / Provider) each with **YTD analytics**: the operator sees the escrow ledger + flow + release controls; the host and provider see their earnings, monthly charts, next payout, and per-booking/job tables.
- `disputes/` — **dispute resolution** for the four failure modes: **host cancellation**, **service shortfall**, **provider no-show**, and **renter no-show**. Each case shows the parties, the escrowed amount, a what-happened timeline, the **applicable policy** (with fault attribution), the Bookings agent's **recommended resolution** (risk-tagged actions — refunds are hard-gated), and **alternative options** — resolve with approve / choose-alternative / deny. A Policies tab documents the standing rule and step-by-step procedure for every scenario.
- `marketplace/` — the consumer booking product (Home · Search · Venue Detail).
- `onboarding/` — supply-side sign-up for **venue hosts and service providers**: a guided wizard (choose persona → 5 steps → submitted) with a live listing preview, the Onboarding agent drafting copy and suggesting pricing from local comps, and Trust & Safety verifying license/insurance. Ends by routing to the operator's approval queue — tying supply growth back into the fleet.

**Specimen cards** (`guidelines/`) — color, type, spacing, radii, shadow, and brand-logo cards rendered in the Design System tab.

**Agent Operations Manual** (`guidelines/agent-manual/`) — interactive reference defining all **14 fleet agents** across 5 facet groups (Supply Growth · Demand Growth · Onboarding & Network · Marketplace Operations · Customer & Platform). Each agent has a mandate, core responsibilities, day-to-day tasks, tools, **autonomy level** (what it does alone vs. needs operator approval), escalation triggers, KPIs, and handoffs. Runs on the "balanced autonomy" policy: agents draft everything; the operator approves anything outbound, customer-facing, financial, or legal — money & legal are hard-gated.

**Fleet Map** (`guidelines/fleet-map/`) — a one-screen architecture diagram of how a goal flows across the fleet: the supply→activate→transact value chain, demand feeding in, Customer & Platform spanning everything, and the **Operator approval gate** every outbound, financial, and legal action must pass through. Hover any agent for its mandate. Pairs with the manual.

**`SKILL.md`** — makes this folder usable as a downloadable Agent Skill.

---

## Caveats
- **Inter** loads from Google Fonts (matching the live app) rather than self-hosted `@font-face` files — so the compiler reports "0 fonts." If you need offline/self-hosted Inter, drop the `.woff2` files in and add `@font-face` rules to `tokens/fonts.css`.
- **Icons** are substituted Feather→Lucide (visually identical). Swap to exact Feather if required.
- No brand photography exists in the repo; venue imagery uses the gradient fallback. The logo now ships as real PNG assets (full lockup + mark) under `assets/`.
