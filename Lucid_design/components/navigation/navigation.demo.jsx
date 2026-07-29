const { NavPills, Segmented, IconRail, IconButton } = DS;
window.Demo = function Demo() {
  const [tab, setTab] = React.useState('payment');
  const [filter, setFilter] = React.useState('software');
  const [dest, setDest] = React.useState('home');
  return (
    <div className="card">
      <div className="stage dusk" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
        <NavPills tone="dark" value={tab} onChange={setTab}
          items={[{ id: 'dash', label: 'Dashboard' }, { id: 'invoicing', label: 'Invoicing' }, { id: 'payment', label: 'Payment' }, { id: 'reports', label: 'Reports' }]} />
        <NavPills tone="glass" size="sm" value={tab} onChange={setTab}
          items={[{ id: 'dash', label: 'Home' }, { id: 'payment', label: 'Smart city' }, { id: 'reports', label: 'Governance' }]} />
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', width: '100%' }}>
          <IconRail tone="dark" value={dest} onChange={setDest} style={{ flexDirection: 'row' }}
            items={[{ id: 'home', icon: 'home' }, { id: 'wallet', icon: 'wallet' }, { id: 'spark', icon: 'spark' }, { id: 'exit', icon: 'exit' }]} />
          <Segmented tone="dark" value={filter} onChange={setFilter} items={['all', 'salary', 'software', 'rent']} style={{ flex: 1 }} />
          <IconButton name="plus" tone="glass" />
        </div>
      </div>
    </div>
  );
};
