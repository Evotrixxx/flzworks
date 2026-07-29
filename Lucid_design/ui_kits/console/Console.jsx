/* eslint-disable */
window.Kit = window.Kit || {};
(function () {
  const { GlassPanel, Button, IconButton, Badge, NavPills, Segmented, IconRail,
          StatBlock, ProgressRing, AvatarStack, Input, Select, Switch, Checkbox, Slider, Glyph } = window.DS;

  const NAV = [
    { id: 'overview', label: 'Overview' },
    { id: 'automation', label: 'Automation' },
    { id: 'settings', label: 'Settings' },
  ];
  const RAIL = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'wallet', icon: 'wallet', label: 'Payments' },
    { id: 'spark', icon: 'spark', label: 'Automations' },
  ];

  function Label({ children, dark = true, style }) {
    return <span style={{ font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
      color: dark ? 'var(--text-on-dark-muted)' : 'var(--text-muted)', ...style }}>{children}</span>;
  }

  function Overview() {
    const [range, setRange] = React.useState('month');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 40, flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, font: 'var(--type-display-lg)', letterSpacing: 'var(--tracking-display)',
            color: 'var(--text-on-dark)', maxWidth: 300 }}>Automatic Payment</h1>
          <ProgressRing value={11} unit="" label="Runs" tone="dark" size={92} accent="var(--accent-warm)" />
          <StatBlock tone="dark" label="Overall balance" value="990,815" unit="$" size="lg" />
          <StatBlock tone="dark" label="Monthly profits" value="170,520" unit="$" size="lg" />
          <StatBlock tone="dark" label="Monthly payments" value="64,520" unit="$" size="lg" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Segmented tone="dark" value={range} onChange={setRange} items={['week', 'month', 'quarter', 'year']} />
          <IconButton name="plus" tone="glassDark" label="New view" />
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <IconButton name="arrow" tone="glassDark" label="Export" />
            <IconButton name="dots" tone="glassDark" label="More" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>
          <GlassPanel tone="dark" radius="var(--radius-lg)" elevation="lg" padding="20px"
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--accent-cool)' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ font: 'var(--type-subtitle)', color: 'var(--text-on-dark)' }}>Design tooling</span>
                <Label>Subscription · 12 seats</Label>
              </div>
              <AvatarStack tone="dark" people={['Ada L', 'Sam O', 'Rae K', 'Ivo N', 'Mei T']} onAdd={() => {}} style={{ marginLeft: 24 }} />
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <IconButton name="close" tone="glassDark" size="sm" label="Skip" />
                <IconButton name="check" tone="cream" size="sm" label="Approve" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[['Date of payment', '18', 'th', '/ month'], ['Number of users', '12', 'ᵃ', 'seats'], ['Payment amount', '375', '$', 'per cycle']]
                .map(([l, v, u, s]) => (
                  <GlassPanel key={l} tone="clear" radius="var(--radius-md)" elevation="none" padding="14px">
                    <StatBlock tone="dark" label={l} value={v} unit={u} sub={s} size="sm" />
                  </GlassPanel>
                ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['Cloud storage', 'Monthly · 12th', '200$'], ['Analytics suite', 'Annually · January', '2,999$'], ['Image library', 'Monthly · 17th', '120$']]
                .map(([n, when, amt]) => (
                  <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 4px',
                    borderTop: '1px solid var(--border-on-dark)' }}>
                    <span style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--sand-200)' }} />
                    <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-on-dark)' }}>{n}</span>
                    <Label style={{ marginLeft: 8 }}>{when}</Label>
                    <span style={{ marginLeft: 'auto', font: 'var(--type-subtitle)', color: 'var(--text-on-dark)' }}>{amt}</span>
                    <Badge tone="glass">Auto</Badge>
                  </div>
                ))}
            </div>
          </GlassPanel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <GlassPanel tone="dark" radius="var(--radius-lg)" elevation="lg" padding="18px"
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 30, height: 30, borderRadius: 999, background: 'var(--accent-warm)' }} />
                <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-on-dark)' }}>Cloud storage</span>
                <IconButton name="dots" tone="glassDark" size="sm" label="Edit" style={{ marginLeft: 'auto' }} />
              </div>
              <StatBlock tone="dark" label="Monthly on the 12th" value="200" unit="$" size="md" />
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="glassDark" size="sm" uppercase>Skip</Button>
                <Button variant="cream" size="sm" uppercase>Approve</Button>
              </div>
            </GlassPanel>
            <GlassPanel tone="solid" radius="var(--radius-lg)" elevation="lg" padding="18px"
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 30, height: 30, borderRadius: 999, background: 'var(--accent-cool)' }} />
                <span style={{ font: 'var(--type-body-sm)' }}>Analytics suite</span>
                <IconButton name="dots" tone="outline" size="sm" label="Edit" style={{ marginLeft: 'auto' }} />
              </div>
              <StatBlock label="Annually · January" value="2,999" unit="$" size="md" />
              <Switch checked label="Renew automatically" />
            </GlassPanel>
          </div>
        </div>
      </div>
    );
  }

  function Automation() {
    const [tier, setTier] = React.useState('enterprise');
    const [method, setMethod] = React.useState('wise');
    const [day, setDay] = React.useState(18);
    const [cap, setCap] = React.useState(375);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24 }}>
          <h1 style={{ margin: 0, font: 'var(--type-display-md)', letterSpacing: 'var(--tracking-display)', color: 'var(--text-on-dark)' }}>
            New automation
          </h1>
          <Label>Draft · saves as you go</Label>
          <Button variant="cream" style={{ marginLeft: 'auto' }}>Discard</Button>
          <Button variant="ink" iconRight={<Glyph name="arrowRight" size={13} />}>Activate</Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, alignItems: 'start' }}>
          <GlassPanel tone="dark" radius="var(--radius-lg)" elevation="lg" padding="20px" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Label>Date of payment</Label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                <button key={d} onClick={() => setDay(d)} style={{
                  height: 28, borderRadius: 999, cursor: 'pointer', border: 'none',
                  background: d === day ? 'var(--cream-25)' : 'transparent',
                  color: d === day ? 'var(--ink-900)' : 'var(--text-on-dark-muted)',
                  font: 'var(--type-meta)', transition: 'var(--transition-control)',
                }}>{d}</button>
              ))}
            </div>
            <Slider tone="dark" label="Monthly cap" value={cap} min={50} max={2000} onChange={setCap} suffix={cap + '$'} />
          </GlassPanel>
          <GlassPanel tone="dark" radius="var(--radius-lg)" elevation="lg" padding="20px" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Label>Payment plan</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['professional', 'Professional', '25'], ['organisation', 'Organisation', '48'], ['enterprise', 'Enterprise', '75']].map(([id, label, price]) => (
                <button key={id} onClick={() => setTier(id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, height: 42, padding: '0 16px',
                  borderRadius: 'var(--radius-pill)', cursor: 'pointer', textAlign: 'left',
                  background: tier === id ? 'var(--cream-25)' : 'var(--glass-dark)',
                  border: tier === id ? '1px solid transparent' : 'var(--glass-edge-dark)',
                  color: tier === id ? 'var(--ink-900)' : 'var(--text-on-dark)',
                  boxShadow: tier === id ? 'var(--shadow-sm)' : 'none', font: 'var(--type-body-sm)',
                  backdropFilter: 'var(--glass-blur-sm)', transition: 'var(--transition-control)',
                }}>
                  {label}
                  <span style={{ marginLeft: 'auto', font: 'var(--type-meta)', opacity: 0.7 }}>{price}$ / user</span>
                </button>
              ))}
            </div>
            <StatBlock tone="dark" label="Per personal user" value={tier === 'enterprise' ? '75' : tier === 'organisation' ? '48' : '25'} unit="$" size="md" />
          </GlassPanel>
          <GlassPanel tone="dark" radius="var(--radius-lg)" elevation="lg" padding="20px" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Label>Pay from</Label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              {[['venmo', 34], ['wise', 64], ['paypal', 44]].map(([id, h]) => (
                <button key={id} onClick={() => setMethod(id)} style={{
                  flex: 1, height: h + 30, borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  background: method === id ? 'var(--cream-25)' : 'var(--glass-dark)',
                  border: method === id ? '1px solid transparent' : 'var(--glass-edge-dark)',
                  color: method === id ? 'var(--ink-900)' : 'var(--text-on-dark-muted)',
                  font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 10,
                  transition: 'var(--transition-control)',
                }}>{id}</button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <StatBlock tone="dark" label="Payment method" value={method === 'wise' ? 'Wise' : method === 'venmo' ? 'Venmo' : 'PayPal'} size="sm" />
              <IconButton name="check" tone="cream" size="lg" label="Confirm" style={{ marginLeft: 'auto' }} />
            </div>
            <Checkbox checked label={<span style={{ color: 'var(--text-on-dark)' }}>Notify the team on each run</span>} />
          </GlassPanel>
        </div>
      </div>
    );
  }

  function Settings() {
    const [notify, setNotify] = React.useState(true);
    const [strict, setStrict] = React.useState(false);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        <GlassPanel tone="dark" radius="var(--radius-lg)" elevation="lg" padding="22px" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ margin: 0, font: 'var(--type-title)', letterSpacing: 'var(--tracking-display)', color: 'var(--text-on-dark)' }}>Workspace</h2>
          <Input tone="dark" label="Workspace name" defaultValue="Lucid Studio" />
          <Input tone="dark" label="Billing email" defaultValue="pay@lucid.studio" icon={<Glyph name="circle" size={13} />} />
          <Select tone="dark" label="Currency" options={['USD — $', 'EUR — €', 'GBP — £']} />
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="cream">Cancel</Button>
            <Button variant="ink">Save changes</Button>
          </div>
        </GlassPanel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <GlassPanel tone="dark" radius="var(--radius-lg)" elevation="lg" padding="22px" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Label>Automation rules</Label>
            <Switch checked={notify} onChange={setNotify} label={<span style={{ color: 'var(--text-on-dark)' }}>Notify before each run</span>} />
            <Switch checked={strict} onChange={setStrict} label={<span style={{ color: 'var(--text-on-dark)' }}>Require two approvals over 1,000$</span>} />
            <Checkbox checked label={<span style={{ color: 'var(--text-on-dark)' }}>Pause when balance drops below cap</span>} />
          </GlassPanel>
          <GlassPanel tone="solid" radius="var(--radius-lg)" elevation="lg" padding="22px" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Label dark={false}>Team</Label>
            <AvatarStack people={['Ada L', 'Sam O', 'Rae K', 'Ivo N']} onAdd={() => {}} />
            <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
              Four people can approve payments. Everyone else has read access.
            </span>
            <Button variant="glass" uppercase size="sm">Manage access</Button>
          </GlassPanel>
        </div>
      </div>
    );
  }

  window.Kit.Console = function Console() {
    const [view, setView] = React.useState('overview');
    const [dest, setDest] = React.useState('wallet');
    return (
      <div style={{ minHeight: '100vh', background: 'var(--backdrop-interior)', backgroundAttachment: 'fixed',
        display: 'flex', gap: 20, padding: 26 }}>
        <IconRail tone="dark" items={RAIL} value={dest} onChange={setDest} style={{ alignSelf: 'center' }}
          footer={<IconButton name="exit" tone="glassDark" size="sm" label="Sign out" />} />
        <GlassPanel tone="dark" blur="xl" radius="var(--radius-xl)" elevation="float"
          style={{ flex: 1, padding: 26, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ font: '700 17px/1 var(--font-display)', letterSpacing: '-0.03em', color: 'var(--text-on-dark)' }}>LUCID</span>
            <NavPills tone="dark" items={NAV} value={view} onChange={setView} />
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
              <AvatarStack tone="dark" people={['Jan S']} size={30} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-on-dark)' }}>Jan Snow</span>
                <Label>Finance manager</Label>
              </div>
              <IconButton name="circle" tone="glassDark" label="Account" />
            </div>
          </div>
          {view === 'overview' && <Overview />}
          {view === 'automation' && <Automation />}
          {view === 'settings' && <Settings />}
        </GlassPanel>
      </div>
    );
  };
})();
