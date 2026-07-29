const { GlassPanel, Button, IconButton, Badge, Card } = DS;
window.Demo = function Demo() {
  return (
    <div className="card">
      <div className="stage dusk" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="ink" size="lg">Add to cart</Button>
          <Button variant="cream">Log in</Button>
          <Button variant="glass" uppercase size="sm">Refresh</Button>
          <Button variant="glassDark">Details</Button>
          <IconButton name="plus" tone="ink" size="lg" />
          <IconButton name="search" tone="cream" />
          <IconButton name="arrow" tone="glass" />
          <IconButton name="dots" tone="glassDark" size="sm" />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Badge tone="ink">Hot drop</Badge>
          <Badge tone="glass">Moonish</Badge>
          <Badge tone="positive" dot>Live</Badge>
          <Badge tone="caution">Pending</Badge>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
          <GlassPanel tone="light" padding="16px" style={{ flex: 1 }}><span className="lbl">light</span></GlassPanel>
          <GlassPanel tone="dark" padding="16px" style={{ flex: 1 }}>
            <span className="lbl" style={{ color: 'var(--text-on-dark-muted)' }}>dark</span>
          </GlassPanel>
          <Card tone="light" eyebrow="Sneakers" title="Vault Runner" meta="From 240$" style={{ width: 210 }}
            media={<div style={{ height: 70, background: 'var(--backdrop-studio)' }} />} />
        </div>
      </div>
    </div>
  );
};
