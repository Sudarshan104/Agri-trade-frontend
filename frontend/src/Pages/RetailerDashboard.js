import { useEffect, useMemo, useState, useContext } from "react";
import API from "../Services/api";
import { getUser } from "../utils/Auth";
import PaymentForm from "../components/PaymentForm";
import { NotificationBell } from "../components/NotificationBell";
import { CartContext } from "./RetailerLayout";
import "./RetailerDashboard.css";

const CART_KEY = "retailer_cart";

export default function RetailerDashboard() {
  const user = getUser();

  const [products, setProducts] = useState([]);
  const [qty, setQty] = useState({});
  const [category, setCategory] = useState("");
  const [searchText, setSearchText] = useState("");







  /* ================= LOAD PRODUCTS ================= */
  const loadProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("Load products error:", err);
      alert("Failed to load products");
      setProducts([]);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* ================= FILTER PRODUCTS ================= */
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (!category) return true;
        return (p.category || "").toLowerCase() === category.toLowerCase();
      })
      .filter((p) => {
        const name = (p.name || "").toLowerCase();
        return name.includes(searchText.toLowerCase());
      });
  }, [products, category, searchText]);

  const { addToCart: contextAddToCart, cart } = useContext(CartContext);

  /* ================= ADD TO CART ================= */
  const addToCart = (product) => {
    const quantity = Number(qty[product.id]);
    if (!quantity || quantity <= 0) {
      alert("Enter valid quantity to add to cart");
      return;
    }

    // Calculate available quantity (original - cart quantity)
    const cartItem = cart.find(item => item.productId === product.id);
    const cartQuantity = cartItem ? cartItem.quantity : 0;
    const availableQuantity = (product.quantity || 0) - cartQuantity;

    if (quantity > availableQuantity) {
      alert("Not enough stock available");
      return;
    }

    contextAddToCart(product, quantity);

    // clear input for that product
    setQty((prev) => ({ ...prev, [product.id]: "" }));
  };



  return (
    <div className="retailer-container">
      {/* Header */}
      <div className="retailer-header">
        <div className="header-content">
          <div>
            <h2 className="dashboard-title">
              Welcome, {user?.name} 👋
              {user?.verificationStatus === 'VERIFIED' && (
                <span className="verification-badge">✅ Verified</span>
              )}
            </h2>
            <p>Explore and purchase fresh products from farmers</p>
          </div>

          <div className="notification-section">
            <NotificationBell />
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="search-filter-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="category-select"
        >
          <option value="">All Categories</option>
          <option value="Vegetable">Vegetable</option>
          <option value="Fruit">Fruit</option>
          <option value="Grain">Grain</option>
        </select>
      </div>

      {/* Products */}
      {filteredProducts.length === 0 ? (
        <p className="empty-text">No products available</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((p) => {
            // Calculate available quantity (original - cart quantity)
            const cartItem = cart.find(item => item.productId === p.id);
            const cartQuantity = cartItem ? cartItem.quantity : 0;
            const availableQuantity = (p.quantity || 0) - cartQuantity;
            const inStock = availableQuantity > 0;

            return (
              <div className="product-card" key={p.id}>
                {p.imageUrl ? (
                  <img
                    src={`http://localhost:9090${p.imageUrl}`}
                    alt={p.name || "Product"}
                    className="product-image"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : (
                  <div className="product-image no-image">No Image</div>
                )}

                <div className="product-content">
                  <h3 className="product-name">{p.name || "Unnamed Product"}</h3>

                  <p className="product-category">
                    🏷️ Category: <span>{p.category || "N/A"}</span>
                  </p>

                  <p className="product-detail">💰 Price: ₹{p.price || 0} / kg</p>

                  <p className="product-detail">
                    📦 Available: {availableQuantity} kg
                  </p>

                  <div className="farmer-info">
                    <p className="farmer-name">
                      👨‍🌾 Farmer: {p.farmer?.name || "N/A"}
                    </p>
                    <p className="farmer-address">
                      📍 Location: {p.farmer?.address || "Not provided"}
                    </p>
                  </div>

                  <input
                    type="number"
                    min="1"
                    max={availableQuantity}
                    placeholder="Quantity (kg)"
                    value={qty[p.id] || ""}
                    onChange={(e) =>
                      setQty((prev) => ({ ...prev, [p.id]: e.target.value }))
                    }
                    disabled={!inStock}
                  />

                  {/* ✅ Add to Cart */}
                  <button
                    className="cart-add-btn"
                    onClick={() => addToCart(p)}
                    disabled={!inStock}
                  >
                    {inStock ? "Add to Cart" : "Out of Stock"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
