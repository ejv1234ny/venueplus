Single-line text field with optional label, leading icon, and inline error state. Full-width with a teal focus ring.

```jsx
<Input label="City" placeholder="Austin, TX" />
<Input leadingIcon={<SearchIcon/>} placeholder="Search venues..." />
<Input label="Email" type="email" error="Enter a valid email" />
```

Props: `label`, `leadingIcon`, `error`, plus all native input attributes (`type`, `placeholder`, `value`, `onChange`, `disabled`).
