import { useMemo, useState } from 'react';
import './App.css';

const PRODUCTS = [
  {
    id: 1,
    name: 'Everyday Essential Tee',
    price: 24,
    category: 'Tops',
    tag: 'Bestseller',
    blurb: 'Heavyweight cotton, relaxed drop shoulder fit.',
  },
  {
    id: 2,
    name: 'Layered Crew Sweatshirt',
    price: 49,
    category: 'Sweats',
    tag: 'New',
    blurb: 'Loopback fleece with tonal embroidery.',
  },
  {
    id: 3,
    name: 'Textured Knit Beanie',
    price: 19,
    category: 'Accessories',
    tag: 'Limited',
    blurb: 'Warm waffle knit with minimal label.',
  },
  {
    id: 4,
    name: 'Studio Cargo Pants',
    price: 59,
    category: 'Bottoms',
    tag: 'Utility',
    blurb: 'Tapered leg, elastic cuffs, six-pocket storage.',
  },
  {
    id: 5,
    name: 'Minimalist Hoodie',
    price: 54,
    category: 'Sweats',
    tag: 'Organic',
    blurb: 'Organic cotton, brushed interior, roomy hood.',
  },
  {
    id: 6,
    name: 'Performance Joggers',
    price: 62,
    category: 'Bottoms',
    tag: 'Stretch',
    blurb: '4-way stretch, cuffed ankles, breathable knit.',
  },
  {
    id: 7,
    name: 'Weekend Denim Jacket',
    price: 89,
    category: 'Outerwear',
    tag: 'Classic',
    blurb: 'Vintage wash, metal hardware, boxy fit.',
  },
  {
    id: 8,
    name: 'Everyday Canvas Tote',
    price: 18,
    category: 'Accessories',
    tag: 'Carry',
    blurb: 'Reinforced base, interior pocket, 18L capacity.',
  },
  {
    id: 9,
    name: 'Padded Puffer Vest',
    price: 79,
    category: 'Outerwear',
    tag: 'Warmth',
    blurb: 'Lightweight fill with water-resistant shell.',
  },
  {
    id: 10,
    name: 'Oversized Oxford Shirt',
    price: 44,
    category: 'Tops',
    tag: 'Crisp',
    blurb: 'Structured cotton with curved hem.',
  },
];

const CATEGORIES = ['All', 'Tops', 'Sweats', 'Bottoms', 'Outerwear', 'Accessories'];

function App() {
  const [tab, setTab] = useState('home');
  const [selected, setSelected] = useState('All');

  const filteredProducts = useMemo(() => {
    if (selected === 'All') return PRODUCTS;
    return PRODUCTS.filter((item) => item.category === selected);
  }, [selected]);

  return (
    <div className="page">
      <nav className="topbar">
        <div className="brand">atelier</div>
        <div className="nav-links">
          <button className={`nav-link ${tab === 'home' ? 'active' : ''}`} onClick={() => setTab('home')}>
            Home
          </button>
          <button className={`nav-link ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>
            Shop
          </button>
          <button className="nav-link muted">Contact</button>
        </div>
        <div className="pill mini-pill">Free shipping over $80</div>
      </nav>

      {tab === 'home' && (
        <>
          <header className="hero">
            <div className="eyebrow">New Season</div>
            <h1>Modern essentials built to live in.</h1>
            <p className="lede">
              Layerable tops, clean sweats, and everyday accessories. Designed for comfort, finished with studio-grade
              details.
            </p>
            <div className="hero-actions">
              <button className="primary" onClick={() => setTab('products')}>
                Shop all
              </button>
              <button className="ghost">Lookbook</button>
            </div>
            <div className="hero-meta">
              <span className="pill">30-day returns</span>
              <span className="pill alt">Carbon-neutral delivery</span>
            </div>
          </header>

          <section className="collections">
            <div className="collection-card">
              <p className="eyebrow">Layering</p>
              <h3>Warm neutrals</h3>
              <p className="muted">Soft fleece and knit textures to pair with denim or cargos.</p>
              <button className="mini ghost-link" onClick={() => setSelected('Sweats') || setTab('products')}>
                Shop sweats
              </button>
            </div>
            <div className="collection-card">
              <p className="eyebrow">Capsule</p>
              <h3>Carry light</h3>
              <p className="muted">Accessories that organize your day without the bulk.</p>
              <button className="mini ghost-link" onClick={() => setSelected('Accessories') || setTab('products')}>
                Shop accessories
              </button>
            </div>
            <div className="collection-card">
              <p className="eyebrow">Outer</p>
              <h3>Weather ready</h3>
              <p className="muted">Transitional jackets and vests with insulated cores.</p>
              <button className="mini ghost-link" onClick={() => setSelected('Outerwear') || setTab('products')}>
                Shop outerwear
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
                <div className="card-footer">
                  <span className="price">${product.price}</span>
                  <button className="secondary">Add to cart</button>
                </div>
                <div className="badge">{product.category}</div>
              </article>
            ))}
          </section>
        </>
      )}

      <section className="cta">
        <div>
          <p className="eyebrow">Need styling help?</p>
          <h2>Book a 15-minute fit consult.</h2>
          <p className="lede">
            Share your size and style notes. We’ll curate a capsule and reserve pieces for in-store try on or delivery.
          </p>
        </div>
        <button className="primary large">Schedule now</button>
      </section>
    </div>
  );
}

export default App;
