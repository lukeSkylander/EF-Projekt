import { useMemo, useState } from 'react';
import './App.css';

const PRODUCTS = [
  // Tees
  {
    id: 'tee-1',
    name: 'Lunar Core Tee',
    price: 28,
    category: 'T-Shirts',
    tag: 'New drop',
    blurb: 'Heavyweight cotton, relaxed shoulders, subtle chest hit.',
    colors: ['Onyx Black', 'Storm Gray', 'Ivory Mist'],
  },
  {
    id: 'tee-2',
    name: 'Eclipse Script Tee',
    price: 30,
    category: 'T-Shirts',
    tag: 'Graphic',
    blurb: 'Water-based front graphic with Eclipse crest.',
    colors: ['Midnight', 'Pale Sand', 'Sage'],
  },
  {
    id: 'tee-3',
    name: 'Axis Rib Tee',
    price: 32,
    category: 'T-Shirts',
    tag: 'Layering',
    blurb: 'Rib knit collar, straight hem, breathable jersey.',
    colors: ['Slate', 'Bone', 'Dust Blue'],
  },
  {
    id: 'tee-4',
    name: 'Contour Pocket Tee',
    price: 34,
    category: 'T-Shirts',
    tag: 'Pocket',
    blurb: 'Boxy fit with tonal pocket stitch and enzyme wash.',
    colors: ['Charcoal', 'Olive Fade', 'Cloud'],
  },
  // Hoodies
  {
    id: 'hoodie-1',
    name: 'Umber Fleece Hoodie',
    price: 68,
    category: 'Hoodies',
    tag: 'Brushed',
    blurb: 'Midweight fleece, double-layer hood, kangaroo pocket.',
    colors: ['Umber', 'Ash', 'Chalk'],
  },
  {
    id: 'hoodie-2',
    name: 'Shadow Zip Hoodie',
    price: 74,
    category: 'Hoodies',
    tag: 'Zip',
    blurb: 'Full zip, matte hardware, minimal chest logo.',
    colors: ['Shadow', 'Sandstone', 'Pine'],
  },
  {
    id: 'hoodie-3',
    name: 'Aurora Dye Hoodie',
    price: 72,
    category: 'Hoodies',
    tag: 'Limited',
    blurb: 'Hand-dyed gradient, dropped shoulder fit.',
    colors: ['Dawn Fade', 'Dusk Fade', 'Stone'],
  },
  {
    id: 'hoodie-4',
    name: 'Studio Heavy Hoodie',
    price: 78,
    category: 'Hoodies',
    tag: 'Heavyweight',
    blurb: '500gsm cotton, tonal embroidery, rib side panels.',
    colors: ['Ink', 'Cement', 'Ivory'],
  },
  // Pants
  {
    id: 'pant-1',
    name: 'Transit Cargo Pant',
    price: 82,
    category: 'Pants',
    tag: 'Cargo',
    blurb: 'Tapered leg, articulated knees, secure cargo pockets.',
    colors: ['Coal', 'Drift', 'Moss'],
  },
  {
    id: 'pant-2',
    name: 'Orbit Track Pant',
    price: 74,
    category: 'Pants',
    tag: 'Performance',
    blurb: '4-way stretch knit with cuffed ankle and hidden zip.',
    colors: ['Pitch', 'Fog', 'Navy'],
  },
  {
    id: 'pant-3',
    name: 'Framework Denim',
    price: 88,
    category: 'Pants',
    tag: 'Denim',
    blurb: 'Straight leg, 13oz selvedge-inspired denim.',
    colors: ['Indigo', 'Carbon', 'Ecru'],
  },
  {
    id: 'pant-4',
    name: 'Contour Lounge Pant',
    price: 68,
    category: 'Pants',
    tag: 'Lounge',
    blurb: 'Brushed French terry with clean front seam.',
    colors: ['Smoke', 'Oat', 'Night'],
  },
];

const CATEGORIES = ['All', 'T-Shirts', 'Hoodies', 'Pants'];

function App() {
  const [tab, setTab] = useState('home');
  const [selected, setSelected] = useState('All');
  const [cart, setCart] = useState({});

  const filteredProducts = useMemo(() => {
    if (selected === 'All') return PRODUCTS;
    return PRODUCTS.filter((item) => item.category === selected);
  }, [selected]);

  const cartItems = useMemo(() => {
    return Object.entries(cart).map(([id, qty]) => {
      const product = PRODUCTS.find((p) => p.id === id);
      return product ? { ...product, qty } : null;
    }).filter(Boolean);
  }, [cart]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.qty * item.price, 0);

  const addToCart = (id) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setTab('cart');
  };

  const updateQty = (id, delta) => {
    setCart((prev) => {
      const next = { ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) };
      if (next[id] === 0) delete next[id];
      return next;
    });
  };

  return (
    <div className="page">
      <nav className="topbar">
        <div className="brand">
          <img className="brand-logo" src="/eclipse-logo.jpg" alt="Eclipse Studios" />
        </div>
        <div className="nav-links">
          <button className={`nav-link ${tab === 'home' ? 'active' : ''}`} onClick={() => setTab('home')}>
            Home
          </button>
          <button className={`nav-link ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>
            Shop
          </button>
          <button className={`nav-link ${tab === 'cart' ? 'active' : ''}`} onClick={() => setTab('cart')}>
            Cart ({cartCount})
          </button>
          <button className={`nav-link ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>
            Order
          </button>
          <button className={`nav-link ${tab === 'account' ? 'active' : ''}`} onClick={() => setTab('account')}>
            Account
          </button>
        </div>
        <div className="pill mini-pill">Free shipping over $120</div>
      </nav>

      {tab === 'home' && (
        <>
          <header className="hero">
            <div className="eyebrow">Eclipse Studios</div>
            <h1>Minimal street uniforms with eclipse-inspired palettes.</h1>
            <p className="lede">
              T-shirts, hoodies, and pants built for everyday layers. Elevated fabrics, quiet branding, and color stories
              inspired by lunar gradients.
            </p>
            <div className="hero-actions">
              <button className="primary" onClick={() => setTab('products')}>
                Shop the drop
              </button>
              <button className="ghost" onClick={() => setSelected('Hoodies') || setTab('products')}>
                Hoodies
              </button>
            </div>
            <div className="hero-meta">
              <span className="pill">30-day returns</span>
              <span className="pill alt">Carbon-neutral delivery</span>
            </div>
          </header>

          <section className="collections">
            <div className="collection-card">
              <p className="eyebrow">T-Shirts</p>
              <h3>Elevated cores</h3>
              <p className="muted">Heavier cotton, crisp collars, and tonal graphics.</p>
              <button className="mini ghost-link" onClick={() => setSelected('T-Shirts') || setTab('products')}>
                Shop tees
              </button>
            </div>
            <div className="collection-card">
              <p className="eyebrow">Hoodies</p>
              <h3>Layered warmth</h3>
              <p className="muted">Brushed fleece, zips, and limited dye runs.</p>
              <button className="mini ghost-link" onClick={() => setSelected('Hoodies') || setTab('products')}>
                Shop hoodies
              </button>
            </div>
            <div className="collection-card">
              <p className="eyebrow">Pants</p>
              <h3>Utility legs</h3>
              <p className="muted">Cargos, track knits, denim, and lounge silhouettes.</p>
              <button className="mini ghost-link" onClick={() => setSelected('Pants') || setTab('products')}>
                Shop pants
              </button>
            </div>
          </section>
        </>
      )}

      {tab === 'products' && (
        <>
          <section className="controls">
            <div>
              <p className="eyebrow">Shop</p>
              <h2>All products</h2>
            </div>
            <div className="control-group">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  className={`chip ${selected === category ? 'active' : ''}`}
                  onClick={() => setSelected(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </section>

          <section className="grid">
            {filteredProducts.map((product) => (
              <article key={product.id} className="card">
                <div className="tag">{product.tag}</div>
                <h3>{product.name}</h3>
                <p className="muted">{product.blurb}</p>
                <div className="swatches">
                  {product.colors.map((color) => (
                    <span key={color} className="swatch">{color}</span>
                  ))}
                </div>
                <div className="card-footer">
                  <span className="price">${product.price}</span>
                  <button className="secondary" onClick={() => addToCart(product.id)}>
                    Add to cart
                  </button>
                </div>
                <div className="badge">{product.category}</div>
              </article>
            ))}
          </section>
        </>
      )}

      {tab === 'cart' && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Cart</p>
              <h2>Items ready to check out</h2>
            </div>
            <div className="pill mini-pill">Total: ${cartTotal.toFixed(2)}</div>
          </div>
          {cartItems.length === 0 ? (
            <p className="muted">Your cart is empty. Add items from the shop.</p>
          ) : (
            <div className="cart-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-row">
                  <div>
                    <h4>{item.name}</h4>
                    <p className="muted">{item.category} · {item.colors[0]}</p>
                  </div>
                  <div className="cart-actions">
                    <div className="qty">
                      <button onClick={() => updateQty(item.id, -1)}>-</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)}>+</button>
                    </div>
                    <div className="price">${(item.price * item.qty).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="panel-footer">
            <button className="ghost" onClick={() => setTab('products')}>Continue shopping</button>
            <button className="primary" onClick={() => setTab('orders')} disabled={!cartItems.length}>
              Proceed to order
            </button>
          </div>
        </section>
      )}

      {tab === 'orders' && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Order</p>
              <h2>Checkout details</h2>
            </div>
            <div className="pill mini-pill">Cart: {cartCount} items</div>
          </div>
          <div className="form-grid">
            <label>
              Full name
              <input type="text" placeholder="Jamie Doe" />
            </label>
            <label>
              Email
              <input type="email" placeholder="you@example.com" />
            </label>
            <label>
              Address
              <input type="text" placeholder="123 Eclipse Ave" />
            </label>
            <label>
              City
              <input type="text" placeholder="Zurich" />
            </label>
            <label>
              Country
              <input type="text" placeholder="Switzerland" />
            </label>
            <label>
              Shipping notes
              <input type="text" placeholder="Gate code, delivery window, etc." />
            </label>
          </div>
          <div className="panel-footer">
            <div className="muted">Total: ${cartTotal.toFixed(2)} (demo only)</div>
            <button className="primary" disabled={!cartItems.length}>
              Place order (demo)
            </button>
          </div>
        </section>
      )}

      {tab === 'account' && (
        <section className="panel account">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Account</p>
              <h2>Login or register</h2>
            </div>
          </div>
          <div className="account-columns">
            <div className="panel-sub">
              <h4>Login</h4>
              <label>
                Email
                <input type="email" placeholder="you@example.com" />
              </label>
              <label>
                Password
                <input type="password" placeholder="••••••••" />
              </label>
              <button className="primary large">Login</button>
            </div>
            <div className="panel-sub">
              <h4>Create account</h4>
              <label>
                Email
                <input type="email" placeholder="you@example.com" />
              </label>
              <label>
                Password
                <input type="password" placeholder="Choose a password" />
              </label>
              <button className="secondary">Register</button>
            </div>
          </div>
        </section>
      )}

      <section className="cta">
        <div>
          <p className="eyebrow">Need styling help?</p>
          <h2>Book a 15-minute fit consult.</h2>
          <p className="lede">
            Share your size and style notes. We’ll curate a capsule and reserve pieces for in-store try on or delivery.
          </p>
        </div>
        <button className="primary large" onClick={() => setTab('account')}>
          Create account
        </button>
      </section>
    </div>
  );
}

export default App;
