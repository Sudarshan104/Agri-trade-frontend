import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Services/api";
import { getUser } from "../utils/Auth";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const storedUser = getUser();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "",
  });

  const [loading, setLoading] = useState(true);

  /* ================= LOAD PROFILE ================= */
  const loadProfile = async () => {
    try {
      // ✅ FIXED (baseURL already has /api)
      const res = await API.get(`/users/${storedUser.id}`);

      // ✅ prevent crash if backend doesn't send phone
      setForm({
        name: res.data?.name || "",
        email: res.data?.email || "",
        phone: res.data?.phone || "",
        address: res.data?.address || "",
        role: res.data?.role || "",
      });
    } catch (err) {
      console.error("Profile load error:", err);
      console.log("Status:", err.response?.status);
      console.log("Data:", err.response?.data);

      alert(
        err.response?.data?.message ||
          `Failed to load profile (Status: ${
            err.response?.status || "No response"
          })`
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    if (!storedUser?.id) {
      navigate("/login");
      return;
    }

    loadProfile();
  }, []);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= SAVE PROFILE ================= */
  const saveProfile = async () => {
    try {
      // ✅ FIXED (baseURL already has /api)
      await API.put(`/users/${storedUser.id}`, form);

      // Update localStorage
      localStorage.setItem("user", JSON.stringify({ ...storedUser, ...form }));

      alert("Profile updated successfully ✅");
    } catch (err) {
      console.error("Profile update error:", err);
      alert(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to update profile"
      );
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="profile-page">
      <h2>My Profile</h2>

      <div className="profile-card">
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} />

        <label>Email</label>
        <input value={form.email} disabled />

        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} />

        <label>Address</label>
        <textarea name="address" value={form.address} onChange={handleChange} />

        <label>Role</label>
        <input value={form.role} disabled />

        <button onClick={saveProfile}>Save Changes</button>
      </div>
    </div>
  );
}
