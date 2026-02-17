import { useState } from "react";
import API from "../Services/api";
import "./DocumentUpload.css"

export default function DocumentUpload() {
  const [formData, setFormData] = useState({
    aadhaarNumber: "",
    panNumber: "",
    aadhaarFile: null,
    panFile: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = new FormData();
      data.append("aadhaarFile", formData.aadhaarFile);
      data.append("panFile", formData.panFile);
      data.append("aadhaarNumber", formData.aadhaarNumber);
      data.append("panNumber", formData.panNumber);

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        setMessage("User not found. Please login again.");
        return;
      }

      await API.post(`/users/upload-documents/${user.id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Documents uploaded successfully! Awaiting admin verification.");
      setFormData({
        aadhaarNumber: "",
        panNumber: "",
        aadhaarFile: null,
        panFile: null,
      });
    } catch (err) {
      setMessage(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="document-upload-page">
      <h2>Upload Documents for Verification</h2>
      <p>Please upload your Aadhaar and PAN documents for admin verification.</p>

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label>Aadhaar Number:</label>
          <input
            type="text"
            name="aadhaarNumber"
            value={formData.aadhaarNumber}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Aadhaar Document (JPG/PNG/PDF):</label>
          <input
            type="file"
            name="aadhaarFile"
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleFileChange}
            required
          />
        </div>

        <div className="form-group">
          <label>PAN Number:</label>
          <input
            type="text"
            name="panNumber"
            value={formData.panNumber}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>PAN Document (JPG/PNG/PDF):</label>
          <input
            type="file"
            name="panFile"
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleFileChange}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="upload-btn">
          {loading ? "Uploading..." : "Upload Documents"}
        </button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
}
