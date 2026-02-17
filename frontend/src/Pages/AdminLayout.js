import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { logout } from "../utils/Auth";
import "./AdminLayout.css";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="admin-shell">
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          ☰
        </button>

        <h2 className="sidebar-logo">
          {collapsed ? "🛡️" : "🛡️ Admin Panel"}
        </h2>

        <ul className="sidebar-menu">
          <li onClick={() => navigate("/admin")}>
            <span className="icon">📊</span>
            <span className="text">Dashboard</span>
          </li>

          <li onClick={() => navigate("/admin/users")}>
            <span className="icon">👥</span>
            <span className="text">Users</span>
          </li>

          <li onClick={() => navigate("/admin/products")}>
            <span className="icon">📦</span>
            <span className="text">Products</span>
          </li>

          <li onClick={() => navigate("/admin/orders")}>
            <span className="icon">🧾</span>
            <span className="text">Orders</span>
          </li>

          <li onClick={() => navigate("/admin/verification")}>
            <span className="icon">✅</span>
            <span className="text">Verification</span>
          </li>

          <li onClick={() => navigate("/admin/support")}>
            <span className="icon">💬</span>
            <span className="text">Support</span>
          </li>

          <li onClick={() => navigate("/admin/issues")}>
            <span className="icon">🆘</span>
            <span className="text">Issues</span>
          </li>

          <li onClick={() => logout(navigate)}>
            <span className="icon">🚪</span>
            <span className="text">Logout</span>
          </li>
        </ul>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
