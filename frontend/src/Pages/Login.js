import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Services/api";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const login = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("Attempting login with:", { email, password });

      // 🔐 Call backend login API
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      console.log("Login response:", res.data);

      // ✅ Save logged-in user and token
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

      // 🔄 Notify Navbar / ProtectedRoute immediately
      window.dispatchEvent(new Event("storage"));

      // 🔀 ROLE BASED REDIRECT
      if (res.data.user.role === "ADMIN") {
        navigate("/admin");
      } else if (res.data.user.role === "FARMER") {
        navigate("/farmer");
      } else if (res.data.user.role === "RETAILER") {
        navigate("/retailer");
      } else if (res.data.user.role === "DELIVERY_AGENT") {
        navigate("/delivery-agent");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>

        {error && <p className="error-text">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}
