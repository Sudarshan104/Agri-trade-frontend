import { useEffect, useState } from "react";
import API from "../Services/api";
import { getUser } from "../utils/Auth";
import "./NotificationBell.css";

export function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  let user;
  try {
    user = getUser();
  } catch (error) {
    console.error("Error getting user in NotificationBell:", error);
    user = null;
  }

  useEffect(() => {
    if (!user?.id) return;

    API.get(`/notifications/user/${user.id}`)
      .then(res => {
        setNotifications(res.data || []);
      })
      .catch(err => {
        console.error("Failed to load notifications", err);
      });
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  return (
    <>
      <div className="notification-bell">
        <button onClick={() => setShowSidebar(!showSidebar)}>
          🔔 {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </button>
      </div>

      {showSidebar && (
        <div className="notification-sidebar-overlay" onClick={() => setShowSidebar(false)}>
          <div className="notification-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="notification-header">
              <h3>Notifications</h3>
              <button className="close-btn" onClick={() => setShowSidebar(false)}>✖</button>
            </div>
            <div className="notification-content">
              {notifications.length === 0 ? (
                <p className="no-notifications">No notifications</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`notification-item ${n.read ? 'read' : 'unread'}`}>
                    <p className="notification-message">{n.message}</p>
                    <small className="notification-time">{new Date(n.createdAt).toLocaleString()}</small>
                    {!n.read && <button className="mark-read-btn" onClick={() => markAsRead(n.id)}>Mark as Read</button>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
