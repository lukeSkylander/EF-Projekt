import { useMemo, useState } from 'react';
import './App.css';

const PRODUCTS = [
  {
    id: 1,
    name: 'Campus Hoodie',
    price: 39,
    category: 'Merch',
    tag: 'New',
    blurb: 'Soft fleece with the school crest.',
  },
  {
    id: 2,
    name: 'Graph Paper Notebook',
    price: 6,
    category: 'Stationery',
    tag: 'Popular',
    blurb: 'Durable A5 with 120gsm pages.',
  },
  {
    id: 3,
    name: 'USB-C Charger 65W',
    price: 29,
    category: 'Tech',
    tag: 'Lab-ready',
    blurb: 'Fast charging for laptops and phones.',
  },
  {
    id: 4,
    name: 'Workshop Gloves',
    price: 12,
    category: 'Lab',
    tag: 'Safety',
    blurb: 'Grip palms for robotics and shop class.',
  },
  {
    id: 5,
    name: 'Reusable Bottle',
    price: 14,
    category: 'Merch',
    tag: 'Eco',
    blurb: 'Insulated steel, 750 ml.',
  },
  {
    id: 6,
    name: 'Colored Fineliners (12)',
    price: 9,
    category: 'Stationery',
    tag: 'Precision',
    blurb: 'Vivid inks for sketches and notes.',
  },
];

const CATEGORIES = ['All', 'Merch', 'Stationery', 'Tech', 'Lab'];

function App() {
  const [selected, setSelected] = useState('All');

  const filteredProducts = useMemo(() => {
    if (selected === 'All') return PRODUCTS;
    return PRODUCTS.filter((item) => item.category === selected);
  }, [selected]);

  return (
    <div className="page">
      <header className="hero">
        <div className="eyebrow">School Webshop</div>
        <h1>Get the right gear for class, labs, and events.</h1>
        <p className="lede">
          Pick up officially approved supplies and merch. Quick campus pickup, clear pricing, and curated essentials.
        </p>
        <div className="hero-actions">
          <button className="primary">Start order</button>
          <button className="ghost">View catalog</button>
        </div>
        <div className="hero-meta">
          <span className="pill">Pickup in the media lab</span>
          <span className="pill alt">Cash or card on-site</span>
        </div>
      </header>

      <section className="controls">
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
        <div className="banner">
          <div>
            <p className="banner-title">Student discounts</p>
            <p className="banner-text">Show your ID at pickup and get 10% off select items.</p>
          </div>
          <button className="mini">See details</button>
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
              <button className="secondary">Add to list</button>
            </div>
            <div className="badge">{product.category}</div>
          </article>
        ))}
      </section>

      <section className="cta">
        <div>
          <p className="eyebrow">Need bulk orders?</p>
          <h2>We kit out clubs and events.</h2>
          <p className="lede">
            Submit quantities, timelines, and branding. We'll confirm availability and pricing within one school day.
          </p>
        </div>
        <button className="primary large">Request a quote</button>
      </section>
    </div>
  );
}

export default App;
