import { Outlet, useNavigate } from "react-router-dom";
import { getUser, logout } from "../utils/Auth";
import { useState } from "react";
import "./FarmerLayout.css";

export default function FarmerLayout() {
  let user;
  try {
    user = getUser();
  } catch (error) {
    console.error("Error getting user in FarmerLayout:", error);
    user = null;
  }
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div
      className={`dashboard-container ${
        collapsed ? "sidebar-collapsed" : ""
      }`}
    >
      {/* ================= SIDEBAR ================= */}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        {/* HEADER */}
        <div className="sidebar-header">
          {!collapsed && <h3>Farmer</h3>}

          <div className="sidebar-header-right">
            <button
              className="sidebar-toggle"
              onClick={() => setCollapsed(!collapsed)}
            >
              ☰
            </button>
          </div>
        </div>



        {/* MENU */}
        <ul className="sidebar-menu">
          <li onClick={() => navigate("/farmer")}>
            📊 {!collapsed && "Dashboard"}
          </li>

          <li onClick={() => navigate("/farmer/add-product")}>
            ➕ {!collapsed && "Add Products"}
          </li>

          <li onClick={() => navigate("/farmer/products")}>
            📦 {!collapsed && "My Products"}
          </li>

          <li onClick={() => navigate("/farmer/orders")}>
            🧾 {!collapsed && "Orders"}
          </li>

          {/* ✅ ANALYTICS */}
          <li onClick={() => navigate("/farmer/analytics")}>
            📈 {!collapsed && "Analytics"}
          </li>

          {/* ✅ REVIEWS */}
          <li onClick={() => navigate("/farmer/reviews")}>
            ⭐ {!collapsed && "Reviews"}
          </li>


          {/* ✅ PROFILE (NEW) */}
          <li onClick={() => navigate("/profile")}>
            👤 {!collapsed && "My Profile"}
          </li>

          {/* ✅ DOCUMENT UPLOAD */}
          <li onClick={() => navigate("/farmer/upload-documents")}>
            📄 {!collapsed && "Upload Documents"}
          </li>

          {/* ✅ HELP & SUPPORT */}
          <li onClick={() => navigate("/farmer/help-support")}>
            ❓ {!collapsed && "Help & Support"}
          </li>

          {/* ✅ REPORT ISSUE */}
          <li onClick={() => navigate("/farmer/report-issue")}>
            🚨 {!collapsed && "Report Issue"}
          </li>

          {/* LOGOUT */}
          <li
            className="logout"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            🚪 {!collapsed && "Logout"}
          </li>
        </ul>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
