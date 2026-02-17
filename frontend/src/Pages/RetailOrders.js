import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Services/api";
import { getUser } from "../utils/Auth";
import LiveTrackingMap from "../components/LiveTrackingMap";
import "./RetailerOrders.css";

// ✅ Tracking Component
const OrderTracking = ({ order, onClose }) => {
  const steps = [
    { status: "PLACED", label: "Order Placed", icon: "📦" },
    { status: "PROCESSING", label: "Processing", icon: "⚙️" },
    { status: "STOCK_CONFIRMED", label: "Stock Confirmed by Farmer", icon: "✅" },
    { status: "PACKED", label: "Packed by Admin", icon: "📦" },
    { status: "SHIPPED", label: "Shipped", icon: "🚚" },
    { status: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: "🚴" },
    { status: "DELIVERED", label: "Delivered", icon: "✅" },
  ];

  const currentStatusIndex = steps.findIndex(step => step.status === order.status);

  return (
    <div className="tracking-overlay" onClick={onClose}>
      <div className="tracking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tracking-header">
          <h3>Order Tracking</h3>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>
        <div className="tracking-content">
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Product:</strong> {order.product?.name}</p>
          <p><strong>Quantity:</strong> {order.quantity} kg</p>
          <div className="tracking-steps">
            {steps.map((step, index) => (
              <div key={step.status} className={`tracking-step ${index <= currentStatusIndex ? 'completed' : ''}`}>
                <div className="step-icon">{step.icon}</div>
                <div className="step-info">
                  <div className="step-label">{step.label}</div>
                  {index <= currentStatusIndex && <div className="step-time">Completed</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Live Map for Active Orders */}
          {['SHIPPED', 'OUT_FOR_DELIVERY'].includes(order.status) && (
            <div style={{ marginTop: '20px' }}>
              <h4>Live Delivery Tracking</h4>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>Updates every 5 seconds</p>
              {/* Assuming we can get deliveryAgentId from order.deliveryAgent.id if populated */}
              {order.deliveryAgent && (
                <LiveTrackingMap
                  agentId={order.deliveryAgent.id}
                  pickupLocation={order.product?.farmer?.address || "Farmer Location"}
                  deliveryLocation={order.retailer?.address || "Retailer Location"}
                />
              )}
              {!order.deliveryAgent && <p>Agent location not available...</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function RetailerOrders() {
  const [orders, setOrders] = useState([]);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const user = getUser();
  const navigate = useNavigate();

  /* ================= LOAD ORDERS ================= */
  const loadOrders = async () => {
    if (!user?.id) return;

    try {
      // ✅ FIXED (baseURL already has /api)
      const res = await API.get(`/orders/user/${user.id}?role=RETAILER`);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load orders", err);
      console.log("Status:", err.response?.status);
      console.log("Data:", err.response?.data);

      setOrders([]);
      alert(
        err.response?.data?.message ||
        `Failed to load orders (Status: ${err.response?.status || "No response"
        })`
      );
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user?.id]);

  /* ================= EDIT ORDER ================= */
  const editOrder = async (order) => {
    const newQty = prompt("Enter new quantity (kg)", order.quantity);
    if (!newQty) return;

    const qtyNumber = Number(newQty);
    if (!qtyNumber || qtyNumber <= 0) {
      alert("Please enter valid quantity");
      return;
    }

    try {
      // ✅ NEW BACKEND ENDPOINT WE WILL ADD
      await API.put(`/orders/retailer/${order.id}/edit`, {
        retailerId: user.id,
        quantity: qtyNumber,
      });

      alert("Order updated successfully ✅");
      loadOrders();
    } catch (err) {
      alert(
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to update order"
      );
    }
  };

  /* ================= CANCEL ORDER ================= */
  const cancelOrder = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;

    try {
      // ✅ NEW BACKEND ENDPOINT WE WILL ADD
      await API.put(`/orders/retailer/${orderId}/cancel`, {
        retailerId: user.id,
      });

      alert("Order cancelled successfully ✅");
      loadOrders();
    } catch (err) {
      alert(
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to cancel order"
      );
    }
  };

  return (
    <div className="orders-container">
      <h2 className="orders-title">My Orders</h2>
      <p className="orders-subtitle">
        Track your placed orders and their current status
      </p>

      {orders.length === 0 ? (
        <p className="no-orders">No orders placed yet</p>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => {
            const product = order.product;
            const status = (order.status || "").toUpperCase();

            return (
              <div className="order-card" key={order.id}>
                {/* PRODUCT IMAGE */}
                {product?.imageUrl ? (
                  <img
                    src={`http://localhost:9090${product.imageUrl}`}
                    alt={product?.name || "Product"}
                    className="order-product-image"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : (
                  <div className="order-product-image no-image">No Image</div>
                )}

                {/* PRODUCT NAME */}
                <h3 className="order-product">
                  {product?.name || "Product unavailable"}
                </h3>

                {/* DETAILS */}
                <p className="order-detail">
                  <span>Quantity:</span> {order.quantity} kg
                </p>

                <p className="order-detail">
                  <span>Price:</span>{" "}
                  {product?.price ? `₹${product.price} / kg` : "N/A"}
                </p>

                <p className="order-detail">
                  <span>Order ID:</span> {order.id}
                </p>

                {/* STATUS */}
                <p className={`order-status ${status.toLowerCase()}`}>
                  {status}
                </p>

                {/* ACTIONS */}
                <div className="order-actions">
                  {["PLACED", "PROCESSING", "MODIFIED"].includes(status) && (
                    <>
                      <button className="edit-btn" onClick={() => editOrder(order)}>
                        Edit
                      </button>

                      <button
                        className="cancel-btn"
                        onClick={() => cancelOrder(order.id)}
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {/* ✅ TRACK ORDER BUTTON */}
                  {!["CANCELLED"].includes(status) && (
                    <button
                      className="track-btn"
                      onClick={async () => {
                        // Refresh orders to get latest status
                        await loadOrders();
                        // Find the updated order from the refreshed orders list
                        const updatedOrder = orders.find(o => o.id === order.id);
                        setTrackingOrder(updatedOrder || order);
                      }}
                    >
                      📍 Track Order
                    </button>
                  )}

                  {/* ✅ REVIEW BUTTON */}
                  {["DELIVERED", "COMPLETED"].includes(status) && (
                    <button
                      className="review-btn"
                      onClick={() => navigate(`/review/${product?.id}`)}
                    >
                      ⭐ Give Review
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ TRACKING MODAL */}
      {trackingOrder && (
        <OrderTracking
          order={trackingOrder}
          onClose={() => setTrackingOrder(null)}
        />
      )}
    </div>
  );
}
