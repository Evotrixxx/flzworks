/* eslint-disable */
window.Kit = window.Kit || {};
(function () {
  const { GlassPanel, Button, IconButton, Badge, Card, NavPills, Segmented, Slider, Glyph, StatBlock } = window.DS;
  const { Shot, Wordmark, Spec } = window.Kit;

  const PRODUCTS = [
    { id: 'hoodie', name: 'Classic Hoodie', cat: 'Outerwear', price: 1199, no: '01' },
    { id: 'runner', name: 'Vault Runner', cat: 'Sneakers', price: 240, no: '02' },
    { id: 'shell', name: 'Dust Shell', cat: 'Outerwear', price: 860, no: '03' },
    { id: 'cap', name: 'Halo Cap', cat: 'Accessories', price: 120, no: '04' },
  ];

  function Chrome({ view, setView, cart }) {
    return (
      <GlassPanel tone="light" blur="xl" radius="var(--radius-pill)" elevation="lg"
        style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '10px 14px' }}>
        <Wordmark />
        <NavPills value={view} onChange={setView} size="sm" tone="glass"
          items={[{ id: 'shop', label: 'Shop' }, { id: 'product', label: 'Hot drops' }, { id: 'cart', label: 'Bag' }]} />
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <IconButton name="globe" tone="glass" size="sm" label="Region" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase' }}>Lucid shop</span>
            <span style={{ font: 'var(--type-caption)', letterSpacing: 'var(--tracking-caption)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>New collection</span>
          </div>
          <Button variant="ink" size="sm" onClick={() => setView('cart')} iconRight={<Glyph name="chevronRight" size={12} />}>
            Bag · {cart.length}
          </Button>
        </div>
      </GlassPanel>
    );
  }

  function Shop({ setView, select, add }) {
    const [cat, setCat] = React.useState('all');
    const list = PRODUCTS.filter(p => cat === 'all' || p.cat.toLowerCase() === cat);
    return (
      <GlassPanel tone="light" blur="xl" radius="var(--radius-xl)" elevation="float" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 28, marginBottom: 22 }}>
          <h1 style={{ margin: 0, font: 'var(--type-display-lg)', letterSpacing: 'var(--tracking-display)', maxWidth: 420 }}>
            New · Cosmic Set 23
          </h1>
          <div style={{ display: 'flex', gap: 34, paddingBottom: 8 }}>
            <Spec label="Drop" lines={['Late 2050', 'Moonish design']} />
            <Spec label="Lining" lines={['53% cotton', '47% polyester']} />
            <Spec label="Colours" lines={['3 colourways', 'Dust · Ink · Cream']} />
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <IconButton name="search" tone="cream" label="Search" />
            <IconButton name="dots" tone="glass" label="More" />
          </div>
        </div>
        <Segmented value={cat} onChange={setCat} items={['all', 'outerwear', 'sneakers', 'accessories']} style={{ marginBottom: 20 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {list.map(p => (
            <Card key={p.id} tone="clear" eyebrow={p.cat} title={p.name} meta={`${p.price}$`}
              media={<div style={{ position: 'relative' }}>
                <Shot label={p.name.toLowerCase()} radius="0" />
                <span style={{ position: 'absolute', top: 12, left: 12 }}><Badge tone="ink">{p.no}</Badge></span>
                <span style={{ position: 'absolute', bottom: 12, right: 12 }}>
                  <IconButton name="search" tone="glass" size="sm" label="Quick look" onClick={() => { select(p); setView('product'); }} />
                </span>
              </div>}
              footer={<Button variant="ink" size="sm" block onClick={() => add(p)}>Add to bag</Button>} />
          ))}
        </div>
      </GlassPanel>
    );
  }

  function Product({ product, add, setView }) {
    const [price, setPrice] = React.useState(product.price);
    return (
      <GlassPanel tone="light" blur="xl" radius="var(--radius-xl)" elevation="float" style={{ padding: 28 }}>
        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', marginBottom: 22 }}>
          <span style={{ font: 'var(--type-display-xl)', letterSpacing: '-0.05em', lineHeight: 0.8 }}>{product.no}</span>
          <div style={{ display: 'flex', gap: 34 }}>
            <Spec label={product.name} lines={['By Lucid Studio', 'The late 2050']} />
            <Spec label="Details" lines={['Logo at left chest', 'Zippered hand pockets', '3 colours']} />
            <Spec label="Pocket bag" lines={['100% cotton']} />
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Button variant="cream" onClick={() => setView('shop')}>Back</Button>
            <IconButton name="dots" tone="ink" label="More" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Card tone="clear" eyebrow="Sneakers" title="Vault Runner" meta="240$"
              media={<Shot label="sneaker shot" radius="0" ratio="1 / 1" />} />
            <GlassPanel tone="light" radius="var(--radius-pill)" elevation="sm"
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px 6px 6px' }}>
              <IconButton name="spark" tone="ink" size="sm" label="Shuffle" />
              <span style={{ font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase' }}>Refresh</span>
              <span style={{ marginLeft: 'auto', font: 'var(--type-caption)', color: 'var(--text-muted)', paddingRight: 8 }}>MOONISH</span>
            </GlassPanel>
          </div>
          <GlassPanel tone="clear" radius="var(--radius-lg)" elevation="sm" style={{ position: 'relative', padding: 0, minHeight: 380 }}>
            <Shot label="hero product shot · bubble scene" ratio="16 / 10" radius="var(--radius-lg)" style={{ height: '100%' }} />
            <div style={{ position: 'absolute', top: 18, left: 20 }}>
              <span style={{ font: 'var(--type-subtitle)' }}>{product.name}</span>
              <div style={{ font: 'var(--type-caption)', letterSpacing: 'var(--tracking-caption)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{product.cat}</div>
            </div>
            <div style={{ position: 'absolute', left: 20, right: 20, bottom: 66 }}>
              <GlassPanel tone="dark" radius="var(--radius-pill)" blur="md" elevation="sm" style={{ padding: '10px 16px' }}>
                <Slider tone="dark" value={price} min={product.price} max={product.price * 2} onChange={setPrice}
                  label={product.name} suffix={`${price}$`} />
              </GlassPanel>
            </div>
            <div style={{ position: 'absolute', right: 20, bottom: 18, display: 'flex', gap: 8 }}>
              <Button variant="ink" size="lg" onClick={() => add(product)}>Add to cart</Button>
              <IconButton name="plus" tone="ink" size="lg" label="Add" onClick={() => add(product)} />
            </div>
          </GlassPanel>
        </div>
      </GlassPanel>
    );
  }

  function Cart({ cart, remove, setView }) {
    const total = cart.reduce((s, p) => s + p.price, 0);
    return (
      <GlassPanel tone="light" blur="xl" radius="var(--radius-xl)" elevation="float" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginBottom: 20 }}>
          <h2 style={{ margin: 0, font: 'var(--type-display-md)', letterSpacing: 'var(--tracking-display)' }}>Your bag</h2>
          <span style={{ font: 'var(--type-meta)', color: 'var(--text-secondary)', paddingBottom: 6 }}>{cart.length} items</span>
          <Button variant="cream" style={{ marginLeft: 'auto' }} onClick={() => setView('shop')}>Keep shopping</Button>
        </div>
        {cart.length === 0 ? (
          <GlassPanel tone="clear" padding="28px" elevation="none">
            <span style={{ font: 'var(--type-meta)', color: 'var(--text-secondary)' }}>Nothing here yet. Add something from the shop.</span>
          </GlassPanel>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cart.map((p, i) => (
              <GlassPanel key={i} tone="clear" radius="var(--radius-lg)" elevation="sm"
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12 }}>
                <Shot label="" ratio="1 / 1" style={{ width: 56, flex: 'none' }} radius="var(--radius-sm)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ font: 'var(--type-subtitle)' }}>{p.name}</span>
                  <span style={{ font: 'var(--type-caption)', letterSpacing: 'var(--tracking-caption)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{p.cat}</span>
                </div>
                <span style={{ marginLeft: 'auto', font: 'var(--type-subtitle)' }}>{p.price}$</span>
                <IconButton name="close" tone="outline" size="sm" label="Remove" onClick={() => remove(i)} />
              </GlassPanel>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginTop: 22 }}>
          <StatBlock label="Total" value={total.toLocaleString()} unit="$" size="md" />
          <Button variant="ink" size="lg" style={{ marginLeft: 'auto' }} iconRight={<Glyph name="arrowRight" size={14} />}>Checkout</Button>
        </div>
      </GlassPanel>
    );
  }

  function Ticker({ setView }) {
    return (
      <GlassPanel tone="dark" blur="xl" radius="var(--radius-pill)" elevation="lg"
        style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '12px 14px' }}>
        <Shot label="" ratio="1 / 1" radius="999px" style={{ width: 62, flex: 'none' }} />
        <h3 style={{ margin: 0, font: 'var(--type-display-md)', letterSpacing: 'var(--tracking-display)', color: 'var(--text-on-dark)' }}>
          New · Cosmic Set 23
        </h3>
        <div style={{ display: 'flex', gap: 28 }}>
          <Spec label="Hot drop" lines={['By Lucid Studio']} />
          <Spec label="Moonish" lines={['Collection 2050']} />
        </div>
        <IconButton name="arrow" tone="glassDark" size="lg" label="Open drop" style={{ marginLeft: 'auto' }} onClick={() => setView('product')} />
      </GlassPanel>
    );
  }

  window.Kit.Storefront = function Storefront() {
    const [view, setView] = React.useState('shop');
    const [product, setProduct] = React.useState(PRODUCTS[0]);
    const [cart, setCart] = React.useState([PRODUCTS[1]]);
    return (
      <div style={{ minHeight: '100vh', padding: 28, background: 'var(--backdrop-dusk)', backgroundAttachment: 'fixed',
        display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Chrome view={view} setView={setView} cart={cart} />
        {view === 'shop' && <Shop setView={setView} select={setProduct} add={p => setCart(c => [...c, p])} />}
        {view === 'product' && <Product product={product} setView={setView} add={p => setCart(c => [...c, p])} />}
        {view === 'cart' && <Cart cart={cart} setView={setView} remove={i => setCart(c => c.filter((_, k) => k !== i))} />}
        <Ticker setView={setView} />
      </div>
    );
  };
})();
