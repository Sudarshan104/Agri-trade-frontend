import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../utils/Auth";
import API from "../Services/api";
import "./HelpSupport.css";

export default function HelpSupport() {
  let user;
  try {
    user = getUser();
  } catch (error) {
    console.error("Error getting user in HelpSupport:", error);
    user = null;
  }
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await API.post("/support/request", {
        subject: formData.subject,
        message: formData.message,
      });
      setSuccess(true);
    } catch (error) {
      console.error("Error submitting support request:", error);
      alert("Failed to submit support request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="help-support-container">
        <div className="success-message">
          <h2>✅ Support Request Submitted!</h2>
          <p>Your support request has been submitted successfully. Our team will review it and get back to you soon.</p>
          <button onClick={() => navigate("/farmer")}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="help-support-container">
      <h1>Help & Support</h1>
      <p>Need assistance? Submit a support request and our team will help you.</p>

      <form className="support-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="subject">Subject *</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Brief description of your issue"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Message *</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Please provide detailed information about your issue..."
            rows="6"
            required
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Submitting..." : "Submit Support Request"}
        </button>
      </form>
    </div>
  );
}
