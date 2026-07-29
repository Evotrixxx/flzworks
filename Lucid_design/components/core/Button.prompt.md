Pill button — every action in Lucid is a capsule; there are no square buttons.

```jsx
<Button variant="ink" size="lg" iconRight={<IconButton.Glyph name="plus" />}>Add to cart</Button>
<Button variant="glass" size="sm" uppercase>Refresh</Button>
```

- One `ink` button per view. `cream` for the secondary ("Log in"), `glass` over photography, `ghost` inside dense toolbars.
- Press state is a 2.5% scale-down plus an inset shadow — never a colour flash.
- `uppercase` swaps to IBM Plex Mono with 0.14em tracking for utility actions.
