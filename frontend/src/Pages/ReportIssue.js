import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../utils/Auth";
import API from "../Services/api";
import "./ReportIssue.css";

export default function ReportIssue() {
  let user;
  try {
    user = getUser();
  } catch (error) {
    console.error("Error getting user in ReportIssue:", error);
    user = null;
  }
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
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
    if (!formData.subject.trim() || !formData.description.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await API.post("/issues/report", {
        subject: formData.subject,
        description: formData.description,
      });
      setSuccess(true);
    } catch (error) {
      console.error("Error submitting issue report:", error);
      alert("Failed to submit issue report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="report-issue-container">
        <div className="success-message">
          <h2>✅ Issue Reported!</h2>
          <p>Your issue has been reported successfully. Our team will investigate and resolve it as soon as possible.</p>
          <button onClick={() => navigate("/farmer")}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-issue-container">
      <h1>Report an Issue</h1>
      <p>Found a bug or experiencing a problem? Let us know so we can fix it.</p>

      <form className="issue-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="subject">Issue Subject *</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Brief title of the issue"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Issue Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Please provide detailed information about the issue, including steps to reproduce..."
            rows="6"
            required
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Submitting..." : "Submit Issue Report"}
        </button>
      </form>
    </div>
  );
}
