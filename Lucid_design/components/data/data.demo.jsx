const { StatBlock, ProgressRing, AvatarStack, GlassPanel } = DS;
window.Demo = function Demo() {
  return (
    <div className="card">
      <div className="stage dusk" style={{ gap: 18, alignItems: 'stretch' }}>
        <GlassPanel tone="dark" padding="18px" style={{ flex: 1, display: 'flex', gap: 22, alignItems: 'center' }}>
          <ProgressRing value={72} unit="%" label="Paid" tone="dark" accent="var(--accent-warm)" size={86} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <StatBlock tone="dark" label="Overall balance" value="990,815" unit="$" size="lg" />
            <AvatarStack tone="dark" people={['Ada L', 'Sam O', 'Rae K', 'Ivo N']} onAdd={() => {}} />
          </div>
        </GlassPanel>
        <GlassPanel tone="light" padding="18px" style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <StatBlock label="Monthly payments" value="64,520" unit="$" size="sm" />
          <StatBlock label="Active users" value="5" size="sm" sub="18th / month" />
        </GlassPanel>
      </div>
    </div>
  );
};
