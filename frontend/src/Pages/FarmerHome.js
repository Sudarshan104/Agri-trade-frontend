import { useNavigate } from "react-router-dom";
import { getUser } from "../utils/Auth";
import "./FarmerHome.css";

export default function FarmerHome() {
  const navigate = useNavigate();
  let user;
  try {
    user = getUser();
  } catch (error) {
    console.error("Error getting user in FarmerHome:", error);
    user = null;
  }

  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="home-title">
          Welcome, {user?.name} <span>👋</span>
        </h1>

        <p className="home-subtitle">Farmer Dashboard Home</p>

        {/* 🌟 MODERN ADD PRODUCT BUTTON */}
        <div className="home-actions">
          <button
            className="add-product-btn"
            onClick={() => navigate("/farmer/add-product")}
          >
            <span className="btn-icon">🌾</span>
            Add Products
          </button>
          <button
          className="add-btn secondary"
          style={{ marginTop: "12px" }}
          onClick={() => navigate("/farmer/products")}
        >
          My Products
        </button>
        </div>

        <p className="home-footer">
          Add produce • Manage inventory • Sell directly
        </p>
      </div>
    </div>
  );
}
