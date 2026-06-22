Checkbox with label — fills teal with a white check when selected. Works controlled or uncontrolled.

```jsx
<Checkbox label="Require security" defaultChecked />
<Checkbox label="Pet friendly" checked={v} onChange={e => setV(e.target.checked)} />
```

Props: `label`, `checked` / `defaultChecked`, `onChange`, `disabled`.
