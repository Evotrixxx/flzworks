Floating glass pill nav — the signature navigation of the system.

```jsx
<NavPills items={['Dashboard','Payment','Reports']} value={tab} onChange={setTab} tone="dark" />
```

- The active pill is opaque cream/white with a soft shadow; inactive pills are plain text.
- Float it over content with `position: absolute` — it should never be flush with a panel edge.
- Use `size="sm"` for secondary filter rows.
