import { useEffect, useMemo, useState } from "react";
import API from "../Services/api";
import "./AdminOrders.css";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deliveryAgents, setDeliveryAgents] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [showNewAgentForm, setShowNewAgentForm] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', email: '', phone: '' });

  // ✅ filter state
  const [filter, setFilter] = useState("ALL"); // ALL | PENDING | DELIVERED | CANCELLED

  /* ================= LOAD ALL ORDERS ================= */
  useEffect(() => {
    loadOrders();
    loadDeliveryAgents();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);

      // ✅ correct endpoint (based on your backend mapping)
      const res = await API.get("/orders/all");
      setOrders(res.data || []);
    } catch (err) {
      console.error("Load orders error:", err);
      alert("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveryAgents = async () => {
    try {
      const res = await API.get("/admin/users");
      const agents = res.data.filter(user => user.role === "DELIVERY_AGENT");
      setDeliveryAgents(agents || []);
    } catch (err) {
      console.error("Load delivery agents error:", err);
    }
  };

  /* ================= UPDATE ORDER STATUS ================= */
  const updateStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, {
        status: newStatus,
      });
      alert("Status updated successfully ✅");
      loadOrders();
    } catch (err) {
      console.error("Status update error:", err);
      let errorMessage = "Failed to update status";

      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else {
          errorMessage = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      alert(`Failed to update status: ${errorMessage}`);
    }
  };

  /* ================= CANCEL ORDER ================= */
  const cancelOrder = async (id) => {
    if (!window.confirm("Cancel this order?")) return;

    try {
      await API.put(`/orders/admin/${id}/cancel`);
      loadOrders();
    } catch (err) {
      console.error("Cancel error:", err.response || err);
      alert(err.response?.data || "Failed to cancel order");
    }
  };

  /* ================= ASSIGN DELIVERY AGENT ================= */
  const assignDeliveryAgent = async (orderId, deliveryAgentId) => {
    try {
      const res = await API.put(`/admin/orders/${orderId}/assign-delivery-agent`, {
        deliveryAgentId: deliveryAgentId,
      });
      const otp = res.data.pickupOtp;
      alert(`Delivery agent assigned successfully ✅\n\nGenerated Pickup OTP: ${otp}\n(Sent to Farmer's Email)`);
      setShowAssignModal(false);
      setSelectedOrder(null);
      loadOrders();
    } catch (err) {
      console.error("Assign delivery agent error:", err);
      let errorMessage = "Failed to assign delivery agent";

      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else {
          errorMessage = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      alert(`Failed to assign delivery agent: ${errorMessage}`);
    }
  };

  const openAssignModal = (order) => {
    setSelectedOrder(order);
    setSelectedAgentId(null);
    setShowNewAgentForm(false);
    setNewAgent({ name: '', email: '', phone: '' });
    setShowAssignModal(true);
  };

  const createDeliveryAgent = async () => {
    try {
      await API.post("/auth/register", {
        name: newAgent.name,
        email: newAgent.email,
        password: "123456",
        password: "123456",
        role: "DELIVERY_AGENT",
        phoneNumber: newAgent.phone,
        address: newAgent.address
      });
      alert("Delivery agent created successfully ✅");
      setShowNewAgentForm(false);
      setNewAgent({ name: '', email: '', phone: '' });
      loadDeliveryAgents();
    } catch (err) {
      console.error("Create delivery agent error:", err);
      alert("Failed to create delivery agent");
    }
  };

  /* ================= FILTERED ORDERS ================= */
  const filteredOrders = useMemo(() => {
    if (filter === "ALL") return orders;

    if (filter === "PENDING") {
      return orders.filter((o) =>
        ["PLACED", "PROCESSING", "MODIFIED"].includes(o.status)
      );
    }

    if (filter === "DELIVERED") {
      return orders.filter((o) => o.status === "DELIVERED");
    }

    if (filter === "CANCELLED") {
      return orders.filter((o) => o.status === "CANCELLED");
    }

    return orders;
  }, [orders, filter]);

  /* ================= UI ================= */
  return (
    <div className="admin-page">
      <h2 className="page-title">Manage Orders</h2>

      {/* ✅ ORDER FILTERS TOP */}
      <div className="order-filters">
        <button
          className={filter === "ALL" ? "active" : ""}
          onClick={() => setFilter("ALL")}
        >
          All ({orders.length})
        </button>

        <button
          className={filter === "PENDING" ? "active" : ""}
          onClick={() => setFilter("PENDING")}
        >
          Pending (
          {
            orders.filter((o) =>
              ["PLACED", "PROCESSING", "MODIFIED"].includes(o.status)
            ).length
          }
          )
        </button>

        <button
          className={filter === "DELIVERED" ? "active" : ""}
          onClick={() => setFilter("DELIVERED")}
        >
          Delivered ({orders.filter((o) => o.status === "DELIVERED").length})
        </button>

        <button
          className={filter === "CANCELLED" ? "active" : ""}
          onClick={() => setFilter("CANCELLED")}
        >
          Cancelled ({orders.filter((o) => o.status === "CANCELLED").length})
        </button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Retailer</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Delivery Agent</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="7" className="empty">
                  Loading orders...
                </td>
              </tr>
            )}

            {!loading &&
              filteredOrders.map((o) => (
                <tr key={o.id}>
                  <td>{o.product?.name}</td>
                  <td>{o.retailer?.name}</td>
                  <td>{o.quantity} kg</td>

                  {/* ✅ STATUS DROPDOWN */}
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      disabled={o.status === "CANCELLED"}
                    >
                      <option value="PLACED">PLACED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="STOCK_CONFIRMED">STOCK_CONFIRMED</option>
                      <option value="PACKED">PACKED</option>
                      <option value="MODIFIED">MODIFIED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>

                  <td>
                    {o.deliveryAgent ? (
                      <span>{o.deliveryAgent.name}</span>
                    ) : (
                      <button
                        className="assign-btn"
                        onClick={() => openAssignModal(o)}
                        disabled={o.status !== "PACKED"}
                      >
                        Assign Agent
                      </button>
                    )}
                  </td>

                  <td>₹ {o.totalAmount}</td>

                  <td>
                    <button
                      className="danger-btn"
                      disabled={o.status === "CANCELLED"}
                      onClick={() => cancelOrder(o.id)}
                    >
                      {o.status === "CANCELLED" ? "Cancelled" : "Cancel"}
                    </button>
                  </td>
                </tr>
              ))}

            {!loading && filteredOrders.length === 0 && (
              <tr>
                <td colSpan="7" className="empty">
                  No orders found for this filter
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Delivery Agent Modal */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3>Assign Delivery Agent</h3>
            <p>Assign a delivery agent to Order #{selectedOrder?.id}</p>

            {!showNewAgentForm ? (
              <>
                {deliveryAgents.length > 0 ? (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Select Existing Agent:
                    </label>
                    <select
                      value={selectedAgentId || ''}
                      onChange={(e) => setSelectedAgentId(e.target.value)}
                      style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    >
                      <option value="">Choose an agent...</option>
                      {deliveryAgents.map(agent => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name} ({agent.email})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p style={{ color: '#666', marginBottom: '20px' }}>
                    No delivery agents available. Create a new one below.
                  </p>
                )}

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <button
                    className="confirm-btn"
                    onClick={() => setShowNewAgentForm(true)}
                    style={{ flex: 1 }}
                  >
                    Create New Agent
                  </button>
                </div>

                <div className="modal-actions">
                  <button
                    className="cancel-btn"
                    onClick={() => setShowAssignModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="confirm-btn"
                    disabled={!selectedAgentId}
                    onClick={() => assignDeliveryAgent(selectedOrder.id, selectedAgentId)}
                  >
                    Assign Selected Agent
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <h4>Create New Delivery Agent</h4>
                  <div style={{ marginBottom: '10px' }}>
                    <input
                      type="text"
                      placeholder="Agent Name"
                      value={newAgent.name}
                      onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                      style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
                    />
                    <input
                      type="email"
                      placeholder="Agent Email"
                      value={newAgent.email}
                      onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                      style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
                    />
                    <input
                      type="text"
                      placeholder="Address (Base Location)"
                      value={newAgent.address || ''}
                      onChange={(e) => setNewAgent({ ...newAgent, address: e.target.value })}
                      style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number (optional)"
                      value={newAgent.phone}
                      onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                      style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    className="cancel-btn"
                    onClick={() => setShowNewAgentForm(false)}
                  >
                    Back
                  </button>
                  <button
                    className="confirm-btn"
                    disabled={!newAgent.name || !newAgent.email}
                    onClick={createDeliveryAgent}
                  >
                    Create & Assign Agent
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
