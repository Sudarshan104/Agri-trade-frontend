import { useEffect, useState } from "react";
import API from "../Services/api";
import { getUser } from "../utils/Auth";
import "./FarmerNotifications.css";

export default function FarmerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  let user;
  try {
    user = getUser();
  } catch (error) {
    console.error("Error getting user in FarmerNotifications:", error);
    user = null;
  }

  useEffect(() => {
    if (!user?.id) return;

    const loadNotifications = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/notifications/user/${user.id}`);
        setNotifications(res.data || []);
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user?.id]);

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n =>
        n.id === id ? {...n, read: true} : n
      ));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="notifications-loading">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <h1>My Notifications</h1>

      {notifications.length === 0 ? (
        <div className="no-notifications">
          <p>No notifications yet</p>
          <p>You'll receive updates about your orders, products, and more here.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map(n => (
            <div key={n.id} className={`notification-item ${n.read ? 'read' : 'unread'}`}>
              <div className="notification-content">
                <div className="notification-message">{n.message}</div>
                <div className="notification-time">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              {!n.read && (
                <button
                  className="mark-read-btn"
                  onClick={() => markAsRead(n.id)}
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
