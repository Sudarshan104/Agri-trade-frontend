import { useState } from "react";
import API from "../Services/api";
import "./Register.css";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "FARMER",
    address: "",
    phoneNumber: ""
  });

  const [error, setError] = useState("");

  const submit = async () => {
    // ✅ Validation
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    if (form.role === "FARMER" && !form.address) {
      setError("Location is required for farmers");
      return;
    }

    try {
      await API.post("/auth/register", form);
      alert("Registration Successful");
      window.location.href = "/login";
    } catch (err) {
      setError("Registration failed. Email may already exist.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Create an Account</h2>
        <p className="register-subtitle">
          Join the Farmer–Retailer Trading Platform
        </p>

        {error && <p className="error-text">{error}</p>}

        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={form.phoneNumber}
          onChange={(e) =>
            setForm({ ...form, phoneNumber: e.target.value })
          }
        />

        {/* ROLE SELECTION */}
        <select
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
        >
          <option value="FARMER">Farmer</option>
          <option value="RETAILER">Retailer</option>
        </select>

        {/* ✅ LOCATION ONLY FOR FARMER */}
        {form.role === "FARMER" && (
          <input
            type="text"
            placeholder="Farm Location / Village"
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
          />
        )}

        <button className="register-btn" onClick={submit}>
          Register
        </button>

        <p className="register-footer">
          Empowering farmers • Enabling direct trade
        </p>
      </div>
    </div>
  );
}
