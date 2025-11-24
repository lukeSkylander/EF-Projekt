import { useMemo, useState } from "react";
import "./App.css";

const PRODUCTS = [
  // T-Shirts
  {
    id: "tee-1",
    name: "T-Shirt 1",
    slug: "/tshirts/tshirt-1",
    price: 28,
    category: "T-Shirts",
    tag: "New drop",
    blurb: "Schweres Baumwoll-Tee mit relaxed Fit und feinem Logo.",
    colors: ["Onyx Black", "Storm Gray", "Ivory"],
  },
  {
    id: "tee-2",
    name: "T-Shirt 2",
    slug: "/tshirts/tshirt-2",
    price: 30,
    category: "T-Shirts",
    tag: "Graphic",
    blurb: "Wasserbasierter Frontprint, angelehnt an das Eclipse Logo.",
    colors: ["Midnight", "Sand", "Sage"],
  },
  {
    id: "tee-3",
    name: "T-Shirt 3",
    slug: "/tshirts/tshirt-3",
    price: 32,
    category: "T-Shirts",
    tag: "Layering",
    blurb: "Feiner Jersey, gerader Saum, ideal zum Layern.",
    colors: ["Slate", "Bone", "Dust Blue"],
  },
  {
    id: "tee-4",
    name: "T-Shirt 4",
    slug: "/tshirts/tshirt-4",
    price: 34,
    category: "T-Shirts",
    tag: "Pocket",
    blurb: "Boxy Fit mit Brusttasche und Enzym-Waschung.",
    colors: ["Charcoal", "Olive", "Cloud"],
  },
  // Hoodies
  {
    id: "hoodie-1",
    name: "Hoodie 1",
    slug: "/hoodies/hoodie-1",
    price: 68,
    category: "Hoodies",
    tag: "Brushed",
    blurb: "Gebürstetes Fleece, doppelte Kapuze, Kängurutasche.",
    colors: ["Umber", "Ash", "Chalk"],
  },
  {
    id: "hoodie-2",
    name: "Hoodie 2",
    slug: "/hoodies/hoodie-2",
    price: 74,
    category: "Hoodies",
    tag: "Zip",
    blurb: "Full-Zip mit matten Zippern und minimaler Stickerei.",
    colors: ["Shadow", "Sandstone", "Pine"],
  },
  {
    id: "hoodie-3",
    name: "Hoodie 3",
    slug: "/hoodies/hoodie-3",
    price: 72,
    category: "Hoodies",
    tag: "Limited",
    blurb: "Handgefärbter Verlauf, dropped Shoulder Fit.",
    colors: ["Dawn Fade", "Dusk Fade", "Stone"],
  },
  {
    id: "hoodie-4",
    name: "Hoodie 4",
    slug: "/hoodies/hoodie-4",
    price: 78,
    category: "Hoodies",
    tag: "Heavyweight",
    blurb: "500gsm Cotton, Ton-in-Ton Logo, Rippeinsätze.",
    colors: ["Ink", "Cement", "Ivory"],
  },
  // Hosen
  {
    id: "pant-1",
    name: "Hose 1",
    slug: "/hosen/hose-1",
    price: 82,
    category: "Pants",
    tag: "Cargo",
    blurb: "Tapered Cargo mit articulierten Knien und sicheren Taschen.",
    colors: ["Coal", "Drift", "Moss"],
  },
  {
    id: "pant-2",
    name: "Hose 2",
    slug: "/hosen/hose-2",
    price: 74,
    category: "Pants",
    tag: "Performance",
    blurb: "4-Way Stretch, Bündchen, verdeckte Reissverschlüsse.",
    colors: ["Pitch", "Fog", "Navy"],
  },
  {
    id: "pant-3",
    name: "Hose 3",
    slug: "/hosen/hose-3",
    price: 88,
    category: "Pants",
    tag: "Denim",
    blurb: "Gerades Bein, 13oz Denim, minimaler Patch.",
    colors: ["Indigo", "Carbon", "Ecru"],
  },
  {
    id: "pant-4",
    name: "Hose 4",
    slug: "/hosen/hose-4",
    price: 68,
    category: "Pants",
    tag: "Lounge",
    blurb: "French Terry, cleane Frontnaht, elastischer Bund.",
    colors: ["Smoke", "Oat", "Night"],
  },
];

const CATEGORIES = ["All", "T-Shirts", "Hoodies", "Pants"];

const INFO_PAGES = [
  { title: "Über uns", path: "/ueber-uns", body: "Eclipse Studios steht für reduzierte Streetwear mit präzisen Details." },
  { title: "Kontakt", path: "/kontakt", body: "Schreibe uns: support@eclipse-studios.com" },
  { title: "FAQ", path: "/faq", body: "Versandzeiten, Pflegehinweise und Größen fallen normal aus." },
  { title: "Versand", path: "/versand", body: "Europaweit klimaneutral, gratis ab 120 €." },
  { title: "Rückgabe", path: "/rueckgabe", body: "30 Tage Rückgaberecht, vorausgesetzt ungetragen." },
  { title: "Grössentabelle", path: "/groessentabelle", body: "XS-XXL; Boxy Fit bei Tees/Hoodies, TTS bei Pants." },
];

const LEGAL_PAGES = [
  { title: "Impressum", path: "/impressum", body: "Eclipse Studios GmbH, Eclipse-Strasse 1, 3000 Bern." },
  { title: "Datenschutz", path: "/datenschutz", body: "Wir verarbeiten Daten nur zur Bestellabwicklung und Support." },
  { title: "AGB", path: "/agb", body: "Standard AGB für Versand, Zahlung, Rückgabe." },
  { title: "Widerruf", path: "/widerruf", body: "Widerrufsrecht 14 Tage, nutze unser Rückgabeportal." },
];

function App() {
  const [tab, setTab] = useState("home");
  const [selected, setSelected] = useState("All");
  const [cart, setCart] = useState({});
  const [isLogged, setIsLogged] = useState(false);
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const base = selected === "All" ? PRODUCTS : PRODUCTS.filter((item) => item.category === selected);
    if (!search.trim()) return base;
    const term = search.toLowerCase();
    return base.filter(
      (p) => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term) || p.tag.toLowerCase().includes(term)
    );
  }, [selected, search]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([id, qty]) => {
        const product = PRODUCTS.find((p) => p.id === id);
        return product ? { ...product, qty } : null;
      })
      .filter(Boolean);
  }, [cart]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.qty * item.price, 0);

  const addToCart = (id) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setTab("cart");
  };

  const updateQty = (id, delta) => {
    setCart((prev) => {
      const next = { ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) };
      if (next[id] === 0) delete next[id];
      return next;
    });
  };

  const renderProducts = (heading) => (
    <>
      <section className="controls">
        <div>
          <p className="eyebrow">Kategorien</p>
          <h2>{heading}</h2>
        </div>
        <div className="control-group">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              className={`chip ${selected === category ? "active" : ""}`}
              onClick={() => setSelected(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="search-inline">
          <input
            type="search"
            placeholder="Suche nach Produkt, Kategorie oder Stichwort"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                In den Warenkorb
              </button>
            </div>
            <div className="badge">{product.category}</div>
          </article>
        ))}
      </section>
    </>
  );

  return (
    <div className="page">
      <nav className="topbar">
        <div className="brand">
          <img className="brand-logo" src="/eclipse-logo.jpg" alt="Eclipse Studios" />
        </div>
        <div className="nav-links">
          <button className={`nav-link ${tab === "home" ? "active" : ""}`} onClick={() => setTab("home")}>
            Startseite
          </button>
          <button className={`nav-link ${tab === "tshirts" ? "active" : ""}`} onClick={() => { setSelected("T-Shirts"); setTab("tshirts"); }}>
            T-Shirts
          </button>
          <button className={`nav-link ${tab === "hoodies" ? "active" : ""}`} onClick={() => { setSelected("Hoodies"); setTab("hoodies"); }}>
            Hoodies
          </button>
          <button className={`nav-link ${tab === "hosen" ? "active" : ""}`} onClick={() => { setSelected("Pants"); setTab("hosen"); }}>
            Hosen
          </button>
          <button className={`nav-link ${tab === "products" ? "active" : ""}`} onClick={() => setTab("products")}>
            Alle Produkte
          </button>
          <button className={`nav-link ${tab === "search" ? "active" : ""}`} onClick={() => setTab("search")}>
            Suche
          </button>
          <button className={`nav-link ${tab === "cart" ? "active" : ""}`} onClick={() => setTab("cart")}>
            Warenkorb ({cartCount})
          </button>
          <button className={`nav-link ${tab === "account" ? "active" : ""}`} onClick={() => setTab("account")}>
            Konto
          </button>
          <button className={`nav-link ${tab === "legal" ? "active" : ""}`} onClick={() => setTab("legal")}>
            Rechtliches
          </button>
        </div>
        <div className="pill mini-pill">Kostenloser Versand ab 120 €</div>
      </nav>

      {tab === "home" && (
        <>
          <header className="hero">
            <div className="eyebrow">Eclipse Studios</div>
            <h1>Monochrome Streetwear, inspiriert vom Logo.</h1>
            <p className="lede">
              Klare Silhouetten, satte Stoffe und dezentes Branding. T-Shirts, Hoodies und Hosen in abgestimmten Farbstories.
            </p>
            <div className="hero-actions">
              <button className="primary" onClick={() => setTab("products")}>
                Shop öffnen
              </button>
              <button className="ghost" onClick={() => { setSelected("Hoodies"); setTab("hoodies"); }}>
                Hoodies ansehen
              </button>
            </div>
            <div className="hero-meta">
              <span className="pill">30 Tage Rückgabe</span>
              <span className="pill alt">Klimaneutraler Versand</span>
            </div>
          </header>

          <section className="collections">
            <div className="collection-card">
              <p className="eyebrow">T-Shirts</p>
              <h3>Elevated cores</h3>
              <p className="muted">Schwerer Jersey, klare Linien, ruhige Farben.</p>
              <button className="mini ghost-link" onClick={() => { setSelected("T-Shirts"); setTab("tshirts"); }}>
                /tshirts
              </button>
            </div>
            <div className="collection-card">
              <p className="eyebrow">Hoodies</p>
              <h3>Layered warmth</h3>
              <p className="muted">Gebürstetes Fleece, Zips und limitierte Färbungen.</p>
              <button className="mini ghost-link" onClick={() => { setSelected("Hoodies"); setTab("hoodies"); }}>
                /hoodies
              </button>
            </div>
            <div className="collection-card">
              <p className="eyebrow">Hosen</p>
              <h3>Utility legs</h3>
              <p className="muted">Cargos, Track Pants, Denim und Lounge Fits.</p>
              <button className="mini ghost-link" onClick={() => { setSelected("Pants"); setTab("hosen"); }}>
                /hosen
              </button>
            </div>
          </section>
        </>
      )}

      {(tab === "products" || tab === "tshirts" || tab === "hoodies" || tab === "hosen") &&
        renderProducts(
          tab === "tshirts"
            ? "T-Shirts (/tshirts)"
            : tab === "hoodies"
            ? "Hoodies (/hoodies)"
            : tab === "hosen"
            ? "Hosen (/hosen)"
            : "Alle Produkte (/kategorien)"
        )}

      {tab === "search" && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Suche (/suche)</p>
              <h2>Produkte durchsuchen</h2>
            </div>
            <div className="pill mini-pill">Live-Filter</div>
          </div>
          <input
            type="search"
            placeholder="Suche nach Produkt, Kategorie oder Stichwort"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="grid">
            {PRODUCTS.filter((p) => {
              const term = search.toLowerCase();
              return (
                p.name.toLowerCase().includes(term) ||
                p.category.toLowerCase().includes(term) ||
                p.tag.toLowerCase().includes(term)
              );
            }).map((product) => (
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
                    In den Warenkorb
                  </button>
                </div>
                <div className="badge">{product.category}</div>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === "cart" && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Warenkorb (/warenkorb)</p>
              <h2>Bereit für Checkout</h2>
            </div>
            <div className="pill mini-pill">Total: ${cartTotal.toFixed(2)}</div>
          </div>
          {cartItems.length === 0 ? (
            <p className="muted">Dein Warenkorb ist leer. Füge Artikel aus dem Shop hinzu.</p>
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
            <button className="ghost" onClick={() => setTab("products")}>Weiter shoppen</button>
            <button className="primary" onClick={() => setTab("checkout")} disabled={!cartItems.length}>
              Zum Checkout
            </button>
          </div>
        </section>
      )}

      {tab === "account" && (
        <section className="panel account">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Konto (/konto)</p>
              <h2>Login oder registrieren</h2>
            </div>
          </div>
          {!isLogged ? (
            <div className="account-columns">
              <div className="panel-sub">
                <h4>Login (/konto/login)</h4>
                <label>
                  Email
                  <input type="email" placeholder="you@example.com" />
                </label>
                <label>
                  Passwort
                  <input type="password" placeholder="••••••••" />
                </label>
                <button className="primary large" onClick={() => setIsLogged(true)}>
                  Login
                </button>
              </div>
              <div className="panel-sub">
                <h4>Registrieren (/konto/registrieren)</h4>
                <label>
                  Email
                  <input type="email" placeholder="you@example.com" />
                </label>
                <label>
                  Passwort
                  <input type="password" placeholder="Passwort wählen" />
                </label>
                <button className="secondary">Account anlegen</button>
              </div>
            </div>
          ) : (
            <div className="panel-sub">
              <h4>Willkommen zurück</h4>
              <p className="muted">Du bist eingeloggt. Weiter zum Checkout.</p>
              <button className="secondary" onClick={() => setTab("checkout")}>
                Weiter zum Checkout
              </button>
            </div>
          )}
        </section>
      )}

      {tab === "checkout" && (
        <section className="panel checkout">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Checkout (/checkout)</p>
              <h3>Bestelldaten</h3>
            </div>
            <div className="pill mini-pill">Total: ${cartTotal.toFixed(2)}</div>
          </div>
          {!isLogged && (
            <div className="panel-sub">
              <h4>Bitte einloggen</h4>
              <p className="muted">Melde dich an, um den Checkout abzuschließen.</p>
              <button className="secondary" onClick={() => setTab("account")}>Zum Login</button>
            </div>
          )}
          {isLogged && (
            <>
              {cartItems.length === 0 ? (
                <p className="muted">Dein Warenkorb ist leer. Füge Artikel hinzu.</p>
              ) : (
                <>
                  <div className="cart-list compact">
                    {cartItems.map((item) => (
                      <div key={item.id} className="cart-row">
                        <div>
                          <h4>{item.name}</h4>
                          <p className="muted">{item.category} · {item.colors[0]} · Qty {item.qty}</p>
                        </div>
                        <div className="price">${(item.price * item.qty).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="form-grid">
                    <label>
                      Vollständiger Name
                      <input type="text" placeholder="Jamie Doe" />
                    </label>
                    <label>
                      Email
                      <input type="email" placeholder="you@example.com" />
                    </label>
                    <label>
                      Adresse
                      <input type="text" placeholder="Eclipse Strasse 1" />
                    </label>
                    <label>
                      Stadt
                      <input type="text" placeholder="Zürich" />
                    </label>
                    <label>
                      Land
                      <input type="text" placeholder="Schweiz" />
                    </label>
                    <label>
                      Versandhinweise
                      <input type="text" placeholder="Türcode, Lieferfenster, etc." />
                    </label>
                  </div>
                  <div className="panel-footer">
                    <div className="muted">Total: ${cartTotal.toFixed(2)} (Demo)</div>
                    <button className="primary" disabled={!cartItems.length} onClick={() => setTab("confirmation")}>
                      Bestellung absenden
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </section>
      )}

      {tab === "confirmation" && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Bestätigung (/checkout/bestaetigung)</p>
              <h2>Danke für deine Bestellung</h2>
            </div>
            <div className="pill mini-pill">Order · Demo</div>
          </div>
          <p className="muted">Wir haben deine Bestellung erhalten. Eine Bestätigung wurde per E-Mail versendet.</p>
          <button className="secondary" onClick={() => setTab("home")}>
            Zur Startseite
          </button>
        </section>
      )}

      {tab === "legal" && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Rechtliches</p>
              <h2>/impressum /datenschutz /agb /widerruf</h2>
            </div>
          </div>
          <div className="info-grid">
            {LEGAL_PAGES.map((item) => (
              <div key={item.path} className="panel-sub">
                <h4>{item.title} ({item.path})</h4>
                <p className="muted">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="cta">
        <div>
          <p className="eyebrow">Style Support</p>
          <h2>Buche ein 15-Minuten Fit Consult.</h2>
          <p className="lede">
            Teile Größe und Stil-Notizen. Wir kuratieren ein Mini-Capsule und reservieren sie für Anprobe oder Versand.
          </p>
        </div>
        <button className="primary large" onClick={() => setTab("account")}>
          Konto erstellen
        </button>
      </section>
    </div>
  );
}

export default App;
