import { Link, useNavigate } from "react-router-dom";
import { getUser, logout as doLogout } from "../utils/Auth";
import { useEffect, useState } from "react";
import "./Navbar.css";

export default function Navbar() {
  const [user, setUser] = useState(() => {
    try {
      return getUser();
    } catch (error) {
      console.error("Error getting user in Navbar:", error);
      return null;
    }
  });
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  /* ===== HANDLE SCROLL ===== */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ===== LISTEN FOR LOGIN / LOGOUT CHANGES ===== */
  useEffect(() => {
    const syncUser = () => {
      setUser(getUser());
    };

    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  /* ===== LOGOUT ===== */
  const handleLogout = () => {
    doLogout();
    setUser(null);            // 🔥 immediate UI update
    navigate("/login");
  };

  return (
    <nav className={`navbar ${scrolled ? "navbar-transparent" : ""}`}>
      <div className="navbar-left">
        <Link to="/" className="brand">
          🌾 AgriTrade
        </Link>
      </div>

      <div className="navbar-right">
        {user && user.name ? (
          <>
            {user.role === "FARMER" && (
              <Link to="/farmer" className="nav-link">
                Farmer Dashboard
              </Link>
            )}

            {user.role === "RETAILER" && (
              <Link to="/retailer" className="nav-link">
                Retailer Dashboard
              </Link>
            )}

            {user.role === "DELIVERY_AGENT" && (
              <Link to="/delivery-agent" className="nav-link">
                Delivery Dashboard
              </Link>
            )}

            <span className="user-role">{user.name}</span>

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="nav-link register-btn">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
