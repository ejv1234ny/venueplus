Primary action control — navy for standard actions, orange (`accent`) for the highest-intent CTA like "Book Now", outline/ghost for secondary actions.

```jsx
<Button variant="primary">Search</Button>
<Button variant="accent" size="lg">Book Now</Button>
<Button variant="outline">Load More</Button>
<Button variant="ghost" size="sm">Cancel</Button>
```

Props: `variant` (primary | accent | outline | ghost), `size` (sm | md | lg), `fullWidth`, `loading`, `leadingIcon`, `trailingIcon`, plus all native button attributes. Use `accent` sparingly — one orange CTA per view.
