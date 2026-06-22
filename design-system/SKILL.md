---
name: venueplus-design
description: Use this skill to generate well-branded interfaces and assets for VenuePlus, either for production or throwaway prototypes/mocks/etc. VenuePlus is an hourly event-venue + services marketplace run by a solo operator backed by an autonomous AI agent fleet. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping both the consumer marketplace and the operator "Mission Control" console.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files. `Dashboards.html` is the entry point — a gallery linking every screen.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Orientation
- **Tokens** live in `tokens/*.css`, all reachable from the root `styles.css` (link that one file). Brand = Brand Navy `#1b5390` (primary) + Brand Orange `#e0561f` (accent CTA) over neutral grays. Font: Inter. Soft shadows, `rounded-xl` cards, 2px Feather/Lucide line icons.
- **Components** (`components/`) are React; consume them from `window.VenuePlusDesignSystem_17f1a7` after loading `_ds_bundle.js`. Each has a `.prompt.md` with usage. Core set: Button, Input, Select, Checkbox, Badge (handles booking status, service category, AND agent risk/decision tiers), Card, Avatar, Tabs, KpiCard.
- **The product is a solo-operator marketplace run by an AI agent fleet.** The governing rule everywhere: **nothing sends, posts, or moves money without operator approval.** Money-movement and legal actions are permanently hard-gated.

## The surfaces (`ui_kits/` + `guidelines/`)
Operator side:
- `mission-control/` — the console: Overview · Agents · Runs · Escalations · Settings (per-agent autonomy gates). Flat, dense, bordered cards, risk/decision badges.
- `finance/` — escrow + role-switchable operator/host/provider dashboards with YTD analytics.
- `disputes/` — host cancellation / service shortfall / provider no-show / renter no-show, each with policy, recommended resolution, alternatives.
- `operator-launch/` — day-one empty state; bootstrap strategy (recruit service providers first, venues follow).
- `mobile-operator/` + `notifications/` — iOS approval queue and lock-screen pings (use `ui_kits/mobile-operator/ios-frame.jsx`).

Marketplace / supply side:
- `marketplace/` — consumer booking flow (Home · Search · Venue detail + itemized checkout: venue, services, liability protection, taxes). Friendly, spacious, navy→orange hero, orange "Book Now" CTA.
- `onboarding/` — guided sign-up for venue hosts AND service providers.

Reference:
- `guidelines/agent-manual/` — duties & autonomy for the 14-agent fleet.
- `guidelines/fleet-map/` — how work flows through the approval gate.
- `guidelines/*.html` — color/type/spacing specimen cards.

When in doubt, copy the relevant UI kit screen as a starting point and restyle with the tokens rather than inventing new patterns.
