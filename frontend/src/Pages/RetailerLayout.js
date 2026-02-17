import { Outlet, useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useMemo, useState, createContext, useContext } from "react";
import { getUser, logout } from "../utils/Auth";
import API from "../Services/api";
import PaymentForm from "../components/PaymentForm";
import { NotificationBell } from "../components/NotificationBell";
import "./RetailerLayout.css";

// Create context for cart functions
export const CartContext = createContext();

const CART_KEY = "retailer_cart";

export default function RetailerLayout() {
  const user = getUser();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // ✅ Cart sidebar
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);

  // ✅ Payment
  const [showPayment, setShowPayment] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  /* ================= LOAD CART FROM SESSION ================= */
  useEffect(() => {
    const saved = sessionStorage.getItem(CART_KEY);
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {
        setCart([]);
      }
    }
  }, []);

  /* ================= SAVE CART TO SESSION ================= */
  useEffect(() => {
    sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  /* ================= CART HELPERS ================= */
  const cartCount = useMemo(() => cart.length, [cart]);

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );
  }, [cart]);

  const updateCartQty = (productId, newQty) => {
    const q = Number(newQty);

    setCart((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;

        if (!q || q <= 0) return { ...item, quantity: 1 };
        if (item.maxStock && q > item.maxStock)
          return { ...item, quantity: item.maxStock };

        return { ...item, quantity: q };
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // ✅ Add to cart function for child components
  const addToCart = (product, quantity = 1) => {
    if (!user?.id) {
      alert("Please login again");
      return;
    }

    if (quantity > (product.quantity || 0)) {
      alert("Not enough stock available");
      return;
    }

    setCart((prev) => {
      const exist = prev.find((item) => item.productId === product.id);

      // ✅ If already in cart => update qty
      if (exist) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          maxStock: product.quantity || 0,
          farmerName: product.farmer?.name || "N/A",
          quantity,
        },
      ];
    });
  };

  /* ================= CHECKOUT CART ================= */
  const checkoutCart = async () => {
    if (!user?.id) {
      alert("Please login again");
      return;
    }

    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      // ✅ Place orders (one per cart item)
      const createdOrders = [];
      let totalAmount = 0;

      for (const item of cart) {
        // productId, retailerId, quantity
        const orderRes = await API.post("/orders/create", {
          productId: item.productId,
          retailerId: user.id,
          quantity: item.quantity,
        });

        createdOrders.push(orderRes.data);

        totalAmount += (item.price || 0) * item.quantity;
      }

      // ✅ Open payment form for total
      setOrderDetails({
        // if PaymentForm expects orderId, send all ids joined
        orderId: createdOrders.map((o) => o.orderId || o.id).join(","),
        amount: totalAmount,
      });

      setShowPayment(true);
      setCartOpen(false);
    } catch (err) {
      console.error("Checkout failed:", err);

      // Improved error message extraction
      let errorMessage = "Checkout failed";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (typeof err.response?.data === 'string') {
        errorMessage = err.response.data;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message && typeof err.message === 'string') {
        errorMessage = err.message;
      } else if (err.response?.status) {
        errorMessage = `Checkout failed (Status: ${err.response.status})`;
      }

      alert(errorMessage);
    }
  };

  /* ================= PAYMENT EVENTS ================= */
  const handlePaymentSuccess = () => {
    alert("Payment successful ✅ Orders confirmed!");
    setShowPayment(false);
    setOrderDetails(null);
    clearCart();
  };

  const handlePaymentFailure = (error) => {
    alert(`Payment failed: ${error}`);
    setShowPayment(false);
    setOrderDetails(null);
  };

  if (!user) return null;

  return (
    <div className="retailer-shell">
      {/* ================= SIDEBAR ================= */}
      <aside className={`retailer-sidebar ${collapsed ? "collapsed" : ""}`}>
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          ☰
        </button>

        <div className="sidebar-header">
          <h2 className="sidebar-logo">{collapsed ? "🛒" : "🛒 Retailer Panel"}</h2>
        </div>

        <ul className="sidebar-menu">
          <li onClick={() => navigate("/retailer")}>
            <span className="icon">🏠</span>
            <span className="text">Home</span>
          </li>

          <li onClick={() => navigate("/retailer/products")}>
            <span className="icon">📦</span>
            <span className="text">Products</span>
          </li>

          <li onClick={() => navigate("/retailer/orders")}>
            <span className="icon">🧾</span>
            <span className="text">Orders</span>
          </li>

          {/* ✅ CART MENU */}
          <li onClick={() => setCartOpen(true)}>
            <span className="icon">🛒</span>
            <span className="text">
              Cart {cartCount > 0 ? `(${cartCount})` : ""}
            </span>
          </li>

          <li onClick={() => navigate("/profile")}>
            <span className="icon">👤</span>
            <span className="text">My Profile</span>
          </li>

          {/* ✅ DOCUMENT UPLOAD */}
          <li onClick={() => navigate("/retailer/upload-documents")}>
            <span className="icon">📄</span>
            <span className="text">Upload Documents</span>
          </li>

          {/* ✅ HELP & SUPPORT */}
          <li onClick={() => navigate("/retailer/help-support")}>
            <span className="icon">❓</span>
            <span className="text">Help & Support</span>
          </li>

          {/* ✅ REPORT ISSUE */}
          <li onClick={() => navigate("/retailer/report-issue")}>
            <span className="icon">🚨</span>
            <span className="text">Report Issue</span>
          </li>

          <li
            onClick={() => {
              logout();
              sessionStorage.removeItem(CART_KEY); // ✅ clear cart on logout
              navigate("/login");
            }}
          >
            <span className="icon">🚪</span>
            <span className="text">Logout</span>
          </li>
        </ul>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="retailer-main">
        <div className="content-header">
          <NotificationBell />
        </div>

        {/* ✅ Payment Popup/Section */}
        {showPayment && orderDetails && (
          <div className="payment-container">
            <PaymentForm
              amount={orderDetails.amount}
              orderId={orderDetails.orderId}
              onSuccess={handlePaymentSuccess}
              onFailure={handlePaymentFailure}
              onCancel={() => {
                setShowPayment(false);
                setOrderDetails(null);
              }}
            />
          </div>
        )}

        <CartContext.Provider value={{ addToCart, cart }}>
          <Outlet />
        </CartContext.Provider>
      </main>

      {/* ================= CART SIDEBAR ================= */}
      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)}>
          <div className="cart-sidebar-panel" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h3>🛒 My Cart</h3>
              <button className="cart-close" onClick={() => setCartOpen(false)}>
                ✖
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="cart-empty">Your cart is empty</p>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.productId}>
                      <div className="cart-left">
                        <p className="cart-item-name">{item.name}</p>
                        <p className="cart-item-meta">
                          👨‍🌾 {item.farmerName || "N/A"}
                        </p>
                        <p className="cart-item-meta">₹ {item.price} / kg</p>
                      </div>

                      <div className="cart-right">
                        <input
                          type="number"
                          min="1"
                          max={item.maxStock || 999999}
                          value={item.quantity}
                          onChange={(e) =>
                            updateCartQty(item.productId, e.target.value)
                          }
                        />
                        <button
                          className="cart-remove"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <p className="cart-total">
                    Total: <b>₹ {cartTotal}</b>
                  </p>

                  <div className="cart-actions">
                    <button className="cart-clear" onClick={clearCart}>
                      Clear
                    </button>

                    <button className="cart-checkout" onClick={checkoutCart}>
                      Checkout & Pay
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
