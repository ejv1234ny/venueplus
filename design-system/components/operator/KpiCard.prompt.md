Mission Control metric tile — a small label over a large number. Used in the operator dashboard KPI grid (GMV, active venues, open escalations, fleet status). Set `accent` to a status color to flag health.

```jsx
<KpiCard label="GMV (captured)" value="$48,200" delta="+12% vs last 30d" deltaTone="up" />
<KpiCard label="Open escalations" value={3} accent="var(--status-pending-fg)" />
<KpiCard label="Fleet status" value="ENABLED" accent="var(--status-success-fg)" />
```

Props: `label`, `value`, `accent` (CSS color), `delta`, `deltaTone` (up | down | neutral).
