Small rounded pill for booking statuses and service categories. Pass `status` or `category` and it auto-picks the right color; or set `tone` directly.

```jsx
<Badge status="confirmed" />        {/* green */}
<Badge status="cancelled" />        {/* red */}
<Badge category="security" />       {/* red chip */}
<Badge category="dj" />             {/* pink chip */}
<Badge tone="brand">Featured</Badge>
```

Props: `tone`, `status`, `category`, `capitalize`. Status→tone and category→color maps are built in.
