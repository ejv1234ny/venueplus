Dropdown select that matches the Input field shape (rounded-lg, teal focus, custom chevron).

```jsx
<Select label="Sort" options={[
  {value:'relevance', label:'Relevance'},
  {value:'price_asc', label:'Price ↑'},
]} />
```

Props: `label`, `options` ([{value,label}]) or `<option>` children, plus native select attributes.
