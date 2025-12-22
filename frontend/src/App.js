import { useEffect, useState } from "react";
import "./App.css";
import {
	authAPI,
	productsAPI,
	cartAPI,
	addressesAPI,
	ordersAPI,
	usersAPI,
	getToken,
} from "./api";

const imageLookup = {
	hoodie: {
		black: "/productimages/knit-black.jpg",
		gray: "/productimages/knit-gray.jpg",
		grey: "/productimages/knit-gray.jpg",
		white: "/productimages/knit-white.jpg",
		red: "/productimages/knit-red.jpg",
		pink: "/productimages/knit-pink.jpg",
		default: "/productimages/knit-gray.jpg",
	},
	"t-shirt": {
		black: "/productimages/tshirt-black.jpg",
		gray: "/productimages/tshirt-gray.jpg",
		grey: "/productimages/tshirt-gray.jpg",
		white: "/productimages/tshirt-white.jpg",
		red: "/productimages/tshirt-red.jpg",
		pink: "/productimages/tshirt-pink.jpg",
		default: "/productimages/tshirt-white.jpg",
	},
	longsleeve: {
		black: "/productimages/longsleeve-black.jpg",
		gray: "/productimages/longsleeve-gray.jpg",
		grey: "/productimages/longsleeve-gray.jpg",
		white: "/productimages/lonsleeve-white.jpg",
		red: "/productimages/longsleeve-red.jpg",
		pink: "/productimages/longsleeve-pink.jpg",
		default: "/productimages/longsleeve-gray.jpg",
	},
};

const normaliseColor = (color = "") =>
	color
		.toLowerCase()
		.replace("ä", "ae")
		.replace("ö", "oe")
		.replace("ü", "ue")
		.replace("ß", "ss")
		.trim();

const getCategoryKey = (category = "") => {
	const lower = category.toLowerCase();
	if (lower.includes("hood")) return "hoodie";
	if (lower.includes("long")) return "longsleeve";
	if (lower.includes("tee")) return "t-shirt";
	return "t-shirt";
};

const getProductImage = (product) => {
	if (!product) return "/productimages/tshirt-white.jpg";
	const categoryKey = getCategoryKey(product.category);
	const colorKey = normaliseColor(product.color);
	const fallback =
		imageLookup[categoryKey]?.[colorKey] ||
		imageLookup[categoryKey]?.default ||
		"/productimages/tshirt-white.jpg";
	return product.image_url || fallback;
};

function App() {
	const [tab, setTab] = useState("home");
	const [products, setProducts] = useState([]);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [cart, setCart] = useState({ items: [], total: 0, count: 0 });
	const [user, setUser] = useState(null);
	const [search, setSearch] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [isLoadingProducts, setIsLoadingProducts] = useState(false);

	// Login/Register form states
	const [loginEmail, setLoginEmail] = useState("");
	const [loginPassword, setLoginPassword] = useState("");
	const [regName, setRegName] = useState("");
	const [regEmail, setRegEmail] = useState("");
	const [regPassword, setRegPassword] = useState("");

	// Checkout form states
	const [checkoutStreet, setCheckoutStreet] = useState("");
	const [checkoutCity, setCheckoutCity] = useState("");
	const [checkoutPostal, setCheckoutPostal] = useState("");
	const [checkoutCountry, setCheckoutCountry] = useState("Switzerland");

	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Clear banners after a short delay
	useEffect(() => {
		if (!error && !success) return undefined;
		const timer = setTimeout(() => {
			setError("");
			setSuccess("");
		}, 2800);
		return () => clearTimeout(timer);
	}, [error, success]);

	// Check if logged in on mount
	useEffect(() => {
		if (getToken()) {
			loadUser();
			loadCart();
		}
		loadProducts();
	}, []);

	const loadUser = async () => {
		try {
			const userData = await usersAPI.getMe();
			setUser(userData);
		} catch (err) {
			console.error("Load user failed:", err);
			authAPI.logout();
		}
	};

	const loadProducts = async (category = "") => {
		try {
			setIsLoadingProducts(true);
			setSelectedProduct(null);
			const data = await productsAPI.getAll(category);
			setProducts(data);
		} catch (err) {
			console.error("Load products failed:", err);
		} finally {
			setIsLoadingProducts(false);
		}
	};

	const loadCart = async () => {
		try {
			const data = await cartAPI.get();
			setCart(data);
		} catch (err) {
			console.error("Load cart failed:", err);
		}
	};

	const handleLogin = async (e) => {
		e.preventDefault();
		setError("");
		try {
			const data = await authAPI.login(loginEmail, loginPassword);
			setUser(data.user);
			setSuccess("Login erfolgreich!");
			await loadCart();
			setTab("products");
		} catch (err) {
			setError(err.response?.data?.error || "Login fehlgeschlagen");
		}
	};

	const handleRegister = async (e) => {
		e.preventDefault();
		setError("");
		try {
			const data = await authAPI.register(regName, regEmail, regPassword);
			setUser(data.user);
			setSuccess("Registrierung erfolgreich!");
			await loadCart();
			setTab("products");
		} catch (err) {
			setError(err.response?.data?.error || "Registrierung fehlgeschlagen");
		}
	};

	const handleLogout = () => {
		authAPI.logout();
		setUser(null);
		setCart({ items: [], total: 0, count: 0 });
		setSelectedProduct(null);
		setTab("home");
	};

	const handleAddToCart = async (productId) => {
		if (!user) {
			setError("Bitte zuerst einloggen");
			setTab("account");
			return;
		}
		try {
			await cartAPI.add(productId, 1);
			await loadCart();
			setSuccess("Zum Warenkorb hinzugefügt!");
			setTab("cart");
		} catch (err) {
			setError(err.response?.data?.error || "Konnte nicht hinzugefügt werden");
		}
	};

	const handleUpdateCartQty = async (cartItemId, delta) => {
		try {
			const item = cart.items.find((i) => i.id === cartItemId);
			const newQty = item.quantity + delta;
			if (newQty <= 0) {
				await cartAPI.remove(cartItemId);
			} else {
				await cartAPI.update(cartItemId, newQty);
			}
			await loadCart();
		} catch (err) {
			setError(err.response?.data?.error || "Konnte Warenkorb nicht aktualisieren");
		}
	};

	const handleCheckout = async (e) => {
		e.preventDefault();
		setError("");
		if (cart.items.length === 0) {
			setError("Warenkorb ist leer");
			return;
		}
		try {
			const address = await addressesAPI.create({
				street: checkoutStreet,
				city: checkoutCity,
				postal_code: checkoutPostal,
				country: checkoutCountry,
			});

			await ordersAPI.create(address.id);

			setSuccess("Bestellung erfolgreich!");
			await loadCart();
			setTab("confirmation");
		} catch (err) {
			setError(err.response?.data?.error || "Checkout fehlgeschlagen");
		}
	};

	const handleCategoryChange = (category) => {
		setSelectedCategory(category);
		setSelectedProduct(null);
		if (category === "All") {
			loadProducts();
		} else {
			const apiCategory = category === "T-Shirts" ? "t-shirt" : "hoodie";
			loadProducts(apiCategory);
		}
	};

	const handleViewProduct = (product) => {
		setSelectedProduct(product);
		setTab("productDetail");
	};

	const handleBackToListing = () => {
		setSelectedProduct(null);
		setTab("products");
	};

	const filteredProducts = search
		? products.filter(
			(p) =>
				p.name.toLowerCase().includes(search.toLowerCase()) ||
				p.category.toLowerCase().includes(search.toLowerCase()),
		)
		: products;

	return (
		<div className="page">
			<nav className="topbar">
				<div className="brand">
					<img className="brand-logo" src="/eclipse-logo.jpg" alt="Eclipse Studios" />
				</div>
				<div className="nav-links">
					<button className={`nav-link ${tab === "home" ? "active" : ""}`} onClick={() => { setSelectedProduct(null); setTab("home"); }}>
						Startseite
					</button>
					<button
						className={`nav-link ${tab === "tshirts" ? "active" : ""}`}
						onClick={() => {
							handleCategoryChange("T-Shirts");
							setTab("tshirts");
						}}
					>
						T-Shirts
					</button>
					<button
						className={`nav-link ${tab === "hoodies" ? "active" : ""}`}
						onClick={() => {
							handleCategoryChange("Hoodies");
							setTab("hoodies");
						}}
					>
						Hoodies
					</button>
					<button className={`nav-link ${tab === "products" ? "active" : ""}`} onClick={() => { handleCategoryChange("All"); setTab("products"); }}>
						Alle Produkte
					</button>
					<button className={`nav-link ${tab === "cart" ? "active" : ""}`} onClick={() => setTab("cart")}>
						Warenkorb ({cart.count || 0})
					</button>
					<button className={`nav-link ${tab === "account" ? "active" : ""}`} onClick={() => setTab("account")}>
						{user ? user.name : "Konto"}
					</button>
					{user && (
						<button className="nav-link" onClick={handleLogout}>
							Logout
						</button>
					)}
				</div>
				<div className="pill mini-pill">Kostenloser Versand ab 120 CHF</div>
			</nav>

			{error && <div className="error-banner">{error}</div>}
			{success && <div className="success-banner">{success}</div>}

			{tab === "home" && (
				<>
					<header className="hero">
						<div className="eyebrow">Eclipse Studios</div>
						<h1>Monochrome Streetwear, inspiriert vom Logo.</h1>
						<p className="lede">
							Klare Silhouetten, satte Stoffe | T-Shirts und Hoodies in abgestimmten Farbstories.
						</p>
						<div className="hero-actions">
							<button className="primary" onClick={() => setTab("products")}>
								Shop öffnen
							</button>
							<button
								className="ghost"
								onClick={() => {
									handleCategoryChange("Hoodies");
									setTab("hoodies");
								}}
							>
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
							<button
								className="mini ghost-link"
								onClick={() => {
									handleCategoryChange("T-Shirts");
									setTab("tshirts");
								}}
							>
								/tshirts
							</button>
						</div>
						<div className="collection-card">
							<p className="eyebrow">Hoodies</p>
							<h3>Layered warmth</h3>
							<p className="muted">Gebürstetes Fleece und limitierte Färbungen.</p>
							<button
								className="mini ghost-link"
								onClick={() => {
									handleCategoryChange("Hoodies");
									setTab("hoodies");
								}}
							>
								/hoodies
							</button>
						</div>
					</section>
				</>
			)}

			{(tab === "products" || tab === "tshirts" || tab === "hoodies") && (
				<>
					<section className="controls">
						<div>
							<p className="eyebrow">Kategorien</p>
							<h2>
								{tab === "tshirts" ? "T-Shirts" : tab === "hoodies" ? "Hoodies" : "Alle Produkte"}
							</h2>
						</div>
						<div className="control-group">
							<button
								className={`chip ${selectedCategory === "All" ? "active" : ""}`}
								onClick={() => handleCategoryChange("All")}
							>
								Alle
							</button>
							<button
								className={`chip ${selectedCategory === "T-Shirts" ? "active" : ""}`}
								onClick={() => handleCategoryChange("T-Shirts")}
							>
								T-Shirts
							</button>
							<button
								className={`chip ${selectedCategory === "Hoodies" ? "active" : ""}`}
								onClick={() => handleCategoryChange("Hoodies")}
							>
								Hoodies
							</button>
						</div>
						<div className="search-inline">
							<input
								type="search"
								placeholder="Suche nach Produkt"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>
					</section>
					<section className="grid">
						{isLoadingProducts && <p className="muted">Produkte werden geladen...</p>}
						{!isLoadingProducts && filteredProducts.length === 0 && (
							<p className="muted">Keine Produkte gefunden. Bitte Filter anpassen.</p>
						)}
						{filteredProducts.map((product) => (
							<article key={product.id} className="card">
								<div
									className="card-media"
									onClick={() => handleViewProduct(product)}
									role="button"
									tabIndex={0}
									onKeyDown={(e) => {
										if (e.key === "Enter") handleViewProduct(product);
									}}
								>
									<img src={getProductImage(product)} alt={product.name} loading="lazy" />
								</div>
								<div className="tag">{product.category}</div>
								<h3>{product.name}</h3>
								<p className="muted">{product.description}</p>
								<div className="swatches">
									<span className="swatch">{product.color}</span>
									<span className="swatch">Size: {product.size}</span>
								</div>
								<div className="card-footer">
									<span className="price">CHF {product.price}</span>
									<button className="secondary" onClick={() => handleAddToCart(product.id)}>
										In den Warenkorb
									</button>
								</div>
								<button className="ghost" onClick={() => handleViewProduct(product)}>
									Details ansehen
								</button>
								<div className="badge">Stock: {product.stock}</div>
							</article>
						))}
					</section>
				</>
			)}

			{tab === "productDetail" && selectedProduct && (
				<section className="panel product-detail">
					<div className="panel-header">
						<div>
							<p className="eyebrow">{selectedProduct.category}</p>
							<h2>{selectedProduct.name}</h2>
						</div>
						<button className="ghost" onClick={handleBackToListing}>
							Zurück
						</button>
					</div>
					<div className="product-detail-grid">
						<div className="product-hero">
							<img src={getProductImage(selectedProduct)} alt={selectedProduct.name} />
						</div>
						<div className="product-info">
							<p className="muted">{selectedProduct.description}</p>
							<div className="swatches">
								<span className="swatch">{selectedProduct.color}</span>
								<span className="swatch">Size: {selectedProduct.size}</span>
							</div>
							<div className="price large">CHF {selectedProduct.price}</div>
							<div className="product-actions">
								<button className="primary" onClick={() => handleAddToCart(selectedProduct.id)}>
									In den Warenkorb
								</button>
								<button className="secondary" onClick={handleBackToListing}>
									Weiter shoppen
								</button>
							</div>
						</div>
					</div>
				</section>
			)}

			{tab === "cart" && (
				<section className="panel">
					<div className="panel-header">
						<div>
							<p className="eyebrow">Warenkorb</p>
							<h2>Bereit für Checkout</h2>
						</div>
						<div className="pill mini-pill">Total: CHF {cart.total}</div>
					</div>
					{cart.items.length === 0 ? (
						<p className="muted">Dein Warenkorb ist leer. Füge Artikel aus dem Shop hinzu.</p>
					) : (
						<div className="cart-list">
							{cart.items.map((item) => (
								<div key={item.id} className="cart-row">
									<div>
										<h4>{item.name}</h4>
										<p className="muted">
											{item.category} | {item.color} | Size {item.size}
										</p>
									</div>
									<div className="cart-actions">
										<div className="qty">
											<button onClick={() => handleUpdateCartQty(item.id, -1)}>-</button>
											<span>{item.quantity}</span>
											<button onClick={() => handleUpdateCartQty(item.id, 1)}>+</button>
										</div>
										<div className="price">CHF {item.subtotal}</div>
									</div>
								</div>
							))}
						</div>
					)}
					<div className="panel-footer">
						<button className="ghost" onClick={() => setTab("products")}>
							Weiter shoppen
						</button>
						<button className="primary" onClick={() => setTab("checkout")} disabled={cart.items.length === 0}>
							Zum Checkout
						</button>
					</div>
				</section>
			)}

			{tab === "account" && (
				<section className="panel account">
					<div className="panel-header">
						<div>
							<p className="eyebrow">Konto</p>
							<h2>{user ? `Willkommen, ${user.name}` : "Login oder registrieren"}</h2>
						</div>
					</div>
					{!user ? (
						<div className="account-columns">
							<div className="panel-sub">
								<h4>Login</h4>
								<form onSubmit={handleLogin}>
									<label>
										Email
										<input
											type="email"
											value={loginEmail}
											onChange={(e) => setLoginEmail(e.target.value)}
											required
										/>
									</label>
									<label>
										Passwort
										<input
											type="password"
											value={loginPassword}
											onChange={(e) => setLoginPassword(e.target.value)}
											required
										/>
									</label>
									<button className="primary large" type="submit">
										Login
									</button>
								</form>
							</div>
							<div className="panel-sub">
								<h4>Registrieren</h4>
								<form onSubmit={handleRegister}>
									<label>
										Name
										<input
											type="text"
											value={regName}
											onChange={(e) => setRegName(e.target.value)}
											required
										/>
									</label>
									<label>
										Email
										<input
											type="email"
											value={regEmail}
											onChange={(e) => setRegEmail(e.target.value)}
											required
										/>
									</label>
									<label>
										Passwort
										<input
											type="password"
											value={regPassword}
											onChange={(e) => setRegPassword(e.target.value)}
											required
										/>
									</label>
									<button className="secondary" type="submit">
										Account anlegen
									</button>
								</form>
							</div>
						</div>
					) : (
						<div className="panel-sub">
							<h4>Account Details</h4>
							<p className="muted">Email: {user.email}</p>
							<p className="muted">Name: {user.name}</p>
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
							<p className="eyebrow">Checkout</p>
							<h3>Bestelldaten</h3>
						</div>
						<div className="pill mini-pill">Total: CHF {cart.total}</div>
					</div>
					{!user && (
						<div className="panel-sub">
							<h4>Bitte einloggen</h4>
							<p className="muted">Melde dich an, um den Checkout abzuschließen.</p>
							<button className="secondary" onClick={() => setTab("account")}>
								Zum Login
							</button>
						</div>
					)}
					{user && (
						<>
							{cart.items.length === 0 ? (
								<p className="muted">Dein Warenkorb ist leer. Füge Artikel hinzu.</p>
							) : (
								<>
									<div className="cart-list compact">
										{cart.items.map((item) => (
											<div key={item.id} className="cart-row">
												<div>
													<h4>{item.name}</h4>
													<p className="muted">
														{item.category} | Qty {item.quantity}
													</p>
												</div>
												<div className="price">CHF {item.subtotal}</div>
											</div>
										))}
									</div>
									<form className="form-grid" onSubmit={handleCheckout}>
										<label>
											Adresse
											<input
												type="text"
												value={checkoutStreet}
												onChange={(e) => setCheckoutStreet(e.target.value)}
												required
											/>
										</label>
										<label>
											Stadt
											<input
												type="text"
												value={checkoutCity}
												onChange={(e) => setCheckoutCity(e.target.value)}
												required
											/>
										</label>
										<label>
											PLZ
											<input
												type="text"
												value={checkoutPostal}
												onChange={(e) => setCheckoutPostal(e.target.value)}
												required
											/>
										</label>
										<label>
											Land
											<input
												type="text"
												value={checkoutCountry}
												onChange={(e) => setCheckoutCountry(e.target.value)}
												required
											/>
										</label>
										<div className="panel-footer">
											<div className="muted">Total: CHF {cart.total}</div>
											<button className="primary" type="submit">
												Bestellung absenden
											</button>
										</div>
									</form>
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
							<p className="eyebrow">Bestätigung</p>
							<h2>Danke für deine Bestellung</h2>
						</div>
					</div>
					<p className="muted">Wir haben deine Bestellung erhalten. Eine Bestätigung wurde per E-Mail versendet.</p>
					<button className="secondary" onClick={() => setTab("home")}>
						Zur Startseite
					</button>
				</section>
			)}

			<section className="cta">
				<div>
					<p className="eyebrow">Style Support</p>
					<h2>Eclipse Studios Webshop</h2>
					<p className="lede">T-Shirts und Hoodies mit frischen Produktseiten und Bildern.</p>
				</div>
				{!user && (
					<button className="primary large" onClick={() => setTab("account")}>
						Konto erstellen
					</button>
				)}
			</section>
		</div>
	);
}

export default App;
