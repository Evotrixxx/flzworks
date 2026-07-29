Circular icon button — the workhorse control in glass UIs (nav utilities, zoom, close, add).

```jsx
<IconButton name="search" tone="ink" size="lg" label="Search" />
<IconButton name="arrow" tone="glass" />
```

- Always perfectly circular; sizes 28 / 38 / 48px only.
- `Glyph` is exported separately for inline use inside Button or labels: `<Glyph name="arrowRight" size={12} />`.
- The glyph set is deliberately small and 1.4px-stroked. Need something else? Use Lucide (same stroke feel) rather than drawing one.
