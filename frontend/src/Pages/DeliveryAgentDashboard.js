import React, { useState, useEffect } from 'react';
import api from '../Services/api';
import './DeliveryAgentDashboard.css';

import LiveTrackingMap from '../components/LiveTrackingMap';

const DeliveryAgentDashboard = () => {
  const [stats, setStats] = useState({
    totalAssigned: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    todaysDeliveries: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [otp, setOtp] = useState('');
  const [actionType, setActionType] = useState(''); // 'pickup' or 'deliver'
  const [user, setUser] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);

    if (storedUser && storedUser.id) {
      // Start sending location updates
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude }); // Update local state for directions
          try {
            await api.put(`/delivery-agents/${storedUser.id}/location`, {
              latitude,
              longitude
            });
            // Optional: log or handle success
          } catch (err) {
            console.error("Failed to update location:", err);
          }
        },
        (err) => console.error("Location error:", err),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);



  const fetchDashboardData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) return;

      // Fetch assigned orders
      console.log('Fetching orders for Agent ID:', user.id);
      const ordersResponse = await api.get(`/delivery-agents/${user.id}/orders`);
      console.log('Orders Response:', ordersResponse.data);
      const orders = ordersResponse.data || [];

      // Calculate stats
      const totalAssigned = orders.length;
      const pendingDeliveries = orders.filter(order =>
        order.status === 'OUT_FOR_DELIVERY' || order.status === 'SHIPPED'
      ).length;
      const completedDeliveries = orders.filter(order =>
        order.status === 'DELIVERED'
      ).length;
      const todaysDeliveries = orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        const today = new Date();
        return orderDate.toDateString() === today.toDateString() &&
          order.status === 'DELIVERED';
      }).length;

      setStats({
        totalAssigned,
        pendingDeliveries,
        completedDeliveries,
        todaysDeliveries
      });

      // Set recent orders (last 10)
      setRecentOrders(orders.slice(0, 10));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const markAsShipped = async (order) => {
    if (!window.confirm("Confirm mark as SHIPPED?")) return;
    try {
      await api.put(`/orders/${order.id}/status`, {
        status: 'SHIPPED',
        otp: '' // No OTP needed for SHIPPED
      });
      alert("Order marked as SHIPPED!");
      fetchDashboardData();
    } catch (error) {
      console.error("Error marking shipped:", error);
      alert("Failed to mark as shipped");
    }
  };

  const handleAction = (order, action) => {
    if (action === 'ship') {
      markAsShipped(order);
      return;
    }

    // For Delivery, show Directions first
    if (action === 'deliver') {
      setSelectedOrder(order);
      setActionType(action);
      setShowDirectionsModal(true);
      return;
    }

    setSelectedOrder(order);
    setActionType(action);
    setShowOtpModal(true);
    setOtp('');
  };

  const openGoogleMaps = () => {
    if (!selectedOrder?.retailer?.address) {
      alert("Retailer address is missing!");
      return;
    }

    let origin = "";
    if (currentLocation) {
      origin = `${currentLocation.latitude},${currentLocation.longitude}`;
    } else if (user?.address) {
      origin = encodeURIComponent(user.address);
    } else {
      // Fallback if no location data found, just search destination
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOrder.retailer.address)}`, '_blank');
      return;
    }

    // Using Google Maps Directions API URL scheme
    // origin: Agent's location (Lat/Lng or Address)
    // destination: Retailer's address
    const destination = encodeURIComponent(selectedOrder.retailer.address);
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

    window.open(url, '_blank');
  };

  const handleProceedToOtp = () => {
    setShowDirectionsModal(false);
    setShowOtpModal(true);
    setOtp('');
  };

  const handleOtpSubmit = async () => {
    if (!otp || otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      let newStatus;
      if (actionType === 'pickup') {
        newStatus = 'OUT_FOR_DELIVERY';
      } else if (actionType === 'deliver') {
        newStatus = 'DELIVERED';
      }

      const response = await api.put(`/orders/${selectedOrder.id}/status`, {
        status: newStatus,
        otp: otp
      });

      if (response.data) {
        alert(`${actionType === 'pickup' ? 'Pickup' : 'Delivery'} confirmed successfully!`);
        setShowOtpModal(false);
        setSelectedOrder(null);
        setOtp('');
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please check the OTP and try again.');
    }
  };

  const resendOtp = async () => {
    try {
      const response = await api.post(`/orders/${selectedOrder.id}/resend-otp`);
      alert(response.data.message || "OTP resent successfully!");
    } catch (error) {
      console.error('Error resending OTP:', error);
      alert('Failed to resend OTP. ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PLACED': return 'gray';
      case 'PROCESSING': return 'blue';
      case 'STOCK_CONFIRMED': return 'blue';
      case 'PACKED': return 'blue';
      case 'SHIPPED': return 'orange';
      case 'OUT_FOR_DELIVERY': return 'orange';
      case 'DELIVERED': return 'green';
      default: return 'gray';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="delivery-agent-dashboard loading">Loading...</div>;
  }

  return (
    <div className="delivery-agent-dashboard">
      <h1>Delivery Agent Dashboard</h1>



      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Assigned</h3>
          <div className="stat-number">{stats.totalAssigned}</div>
        </div>
        <div className="stat-card">
          <h3>Pending Deliveries</h3>
          <div className="stat-number">{stats.pendingDeliveries}</div>
        </div>
        <div className="stat-card">
          <h3>Completed Today</h3>
          <div className="stat-number">{stats.todaysDeliveries}</div>
        </div>
        <div className="stat-card">
          <h3>Total Completed</h3>
          <div className="stat-number">{stats.completedDeliveries}</div>
        </div>
      </div>

      <div className="recent-orders">
        <h2>Live Tracking (Your Location)</h2>
        {user?.id && (
          <LiveTrackingMap
            agentId={user.id}
            pickupLocation="Bangalore" // Default or dynamic if available
            deliveryLocation="Mysore" // Default or dynamic
          />
        )}
      </div>

      <div className="recent-orders">
        <h2>Recent Orders</h2>
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Retailer</th>
                <th>Status</th>
                <th>Order Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.product?.name || 'N/A'}</td>
                  <td>{order.retailer?.name || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td>
                    {order.status === 'PACKED' && (
                      <button
                        className="action-btn"
                        style={{ backgroundColor: '#f39c12' }} // Orange color for Shipped
                        onClick={() => handleAction(order, 'ship')}
                      >
                        Mark Shipped
                      </button>
                    )}
                    {order.status === 'SHIPPED' && (
                      <button
                        className="action-btn pickup-btn"
                        onClick={() => handleAction(order, 'pickup')}
                      >
                        Pick Up
                      </button>
                    )}
                    {order.status === 'OUT_FOR_DELIVERY' && (
                      <button
                        className="action-btn deliver-btn"
                        onClick={() => handleAction(order, 'deliver')}
                      >
                        Deliver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentOrders.length === 0 && (
            <p style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>
              No orders assigned yet.
            </p>
          )}
        </div>
      </div>

      {/* Directions Modal */}
      {showDirectionsModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3>Delivery Directions</h3>
            <div style={{ margin: '20px 0', textAlign: 'left' }}>
              <p><strong>Retailer:</strong> {selectedOrder.retailer?.name}</p>
              <p><strong>Destination:</strong> {selectedOrder.retailer?.address || 'Address not available'}</p>
              <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
                Clicking "Get Directions" will open Google Maps navigation from your current location.
              </p>
            </div>

            <div className="modal-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="confirm-btn"
                onClick={openGoogleMaps}
                style={{ backgroundColor: '#4285F4', width: '100%' }}
              >
                📍 Get Directions (Google Maps)
              </button>

              <button
                className="confirm-btn"
                onClick={handleProceedToOtp}
                style={{ backgroundColor: '#2ecc71', width: '100%' }}
              >
                ✅ Arrived? Proceed to Verification
              </button>

              <button
                className="cancel-btn"
                onClick={() => {
                  setShowDirectionsModal(false);
                  setSelectedOrder(null);
                }}
                style={{ width: '100%' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showOtpModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm {actionType === 'pickup' ? 'Pickup' : 'Delivery'}</h3>
            <p>Please enter the OTP to confirm {actionType} for Order #{selectedOrder?.id}</p>
            <input
              type="text"
              className="otp-input"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength="6"
            />
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowOtpModal(false)}
              >
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={handleOtpSubmit}
                disabled={!otp || otp.length !== 6}
              >
                Confirm
              </button>
            </div>
            {actionType === 'deliver' && (
              <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                  Didn't receive the OTP?
                  <button
                    onClick={resendOtp}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3498db',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: '0 5px'
                    }}
                  >
                    Resend to Retailer
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default DeliveryAgentDashboard;
