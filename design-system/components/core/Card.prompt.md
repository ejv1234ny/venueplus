White rounded-xl surface with a soft shadow. The core container for venues, services, bookings, and panels. `interactive` adds the hover lift used on clickable listing cards.

```jsx
<Card padding="lg">…panel content…</Card>
<Card interactive as="a" href="/venues/1" padding="none">…venue card…</Card>
```

Props: `interactive`, `padding` (none | sm | md | lg), `as`. Use `padding="none"` when the card holds a full-bleed image at the top.
