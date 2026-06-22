Rounded "pill" filter tabs — the category/status filter row from the Services and Bookings pages. Active pill is navy, inactive is light gray.

```jsx
<Tabs
  defaultValue="all"
  items={[
    {value:'all', label:'All'},
    {value:'cleaning', label:'Cleaning'},
    {value:'security', label:'Security', count:3},
  ]}
  onChange={setCat}
/>
```

Props: `items` ([{value,label,count?}]), `value`/`defaultValue`, `onChange(value)`.
