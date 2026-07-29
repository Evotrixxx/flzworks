Translucent blurred surface — use it for every panel, sheet, card shell and toolbar in Lucid; never hand-roll a backdrop-filter.

```jsx
<GlassPanel tone="light" blur="lg" elevation="lg" radius="var(--radius-xl)" padding="24px">
  <p style={{ font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)' }}>OVERVIEW</p>
</GlassPanel>
```

- Glass must sit on a backdrop with contrast (`var(--backdrop-dusk)` / photography). On flat white it disappears.
- `tone="dark"` for panels over bright imagery; `tone="ink"` / `"solid"` for opaque capsules that need to punch (Add to cart, price tiles).
- Nest at most two levels of glass; the third reads as mud. Use `tone="clear"` inside `tone="light"`.
