import { useEffect, useState } from "react";
import API from "../Services/api";
import { getUser } from "../utils/Auth";
import "./FarmerOrders.css";

export default function FarmerOrders() {
  const [orders, setOrders] = useState([]);
  let user;
  try {
    user = getUser();
  } catch (error) {
    console.error("Error getting user in FormerOrders:", error);
    user = null;
  }

  useEffect(() => {
    if (!user?.id) return;

    API.get(`/orders/user/${user.id}?role=FARMER`)
      .then((res) => setOrders(res.data || []))
      .catch(() => setOrders([]));
  }, [user?.id]);

  /* ================= CONFIRM STOCK ================= */
  const confirmStock = async (orderId) => {
    if (!window.confirm("Confirm that you have the stock available for this order?")) return;

    try {
      await API.put(`/orders/${orderId}/status`, {
        status: "STOCK_CONFIRMED",
      });

      alert("Stock confirmed successfully ✅");
      // Reload orders to update status
      loadOrders();
    } catch (err) {
      console.error("Confirm stock error:", err);
      const errorMessage = err.response?.data?.message || err.response?.data || "Failed to confirm stock";
      alert(`Failed to confirm stock: ${errorMessage}`);
    }
  };

  const loadOrders = async () => {
    if (!user?.id) return;

    try {
      const res = await API.get(`/orders/user/${user.id}?role=FARMER`);
      setOrders(res.data || []);
    } catch (err) {
      console.error("Load orders error:", err);
      setOrders([]);
    }
  };

  return (
    <div className="farmer-orders-page">
      <h2 className="orders-title">📦 Orders Received</h2>
      <p className="orders-subtitle">
        Track all orders placed by retailers for your products
      </p>

      {orders.length === 0 ? (
        <p className="no-orders">No orders received yet</p>
      ) : (
        <div className="orders-grid">
          {orders.map((o) => (
            <div className="order-card" key={o.id}>
              <h3 className="product-name">
                {o.product?.name || "Product unavailable"}
              </h3>

              <div className="order-info">
                <p>
                  <span>Retailer:</span> {o.retailer?.name || "N/A"}
                </p>
                <p>
                  <span>Quantity:</span> {o.quantity} kg
                </p>
              </div>

              <span className={`order-status ${o.status.toLowerCase()}`}>
                {o.status}
              </span>

              {/* ✅ CONFIRM STOCK BUTTON */}
              {o.status === "PROCESSING" && (
                <button
                  className="confirm-stock-btn"
                  onClick={() => confirmStock(o.id)}
                >
                  ✅ Confirm Stock
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
