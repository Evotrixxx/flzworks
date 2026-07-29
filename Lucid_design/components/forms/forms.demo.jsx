const { Input, Select, Switch, Checkbox, Slider, Glyph } = DS;
window.Demo = function Demo() {
  const [on, setOn] = React.useState(true);
  const [chk, setChk] = React.useState(true);
  const [plan, setPlan] = React.useState('pro');
  const [v, setV] = React.useState(62);
  const onLight = { color: 'var(--text-primary)' };
  return (
    <div className="card">
      <div className="stage studio" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 16 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Input label="Email" placeholder="you@studio.com" style={{ flex: 1 }} icon={<Glyph name="circle" size={13} />} />
          <Select label="Plan" options={['Studio', 'Organisation', 'Enterprise']} style={{ width: 210 }} />
        </div>
        <Input label="Card" defaultValue="4242 0000" invalid hint="Card number is incomplete" />
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <Switch checked={on} onChange={setOn} label={<span style={onLight}>Auto-pay</span>} />
          <Checkbox checked={chk} onChange={setChk} label={<span style={onLight}>Remember device</span>} />
          <Checkbox round checked={plan === 'pro'} onChange={() => setPlan('pro')} label={<span style={onLight}>Pro</span>} />
          <Checkbox round checked={plan === 'team'} onChange={() => setPlan('team')} label={<span style={onLight}>Team</span>} />
        </div>
        <Slider value={v} onChange={setV} label="Monthly cap" suffix={v * 20 + '$'} />
      </div>
    </div>
  );
};
