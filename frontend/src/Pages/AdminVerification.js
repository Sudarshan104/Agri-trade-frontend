import { useEffect, useState } from "react";
import API from "../Services/api";
import "./AdminVerification.css";

export default function AdminVerification() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    try {
      const res = await API.get("/admin/pending-verifications");
      setPendingUsers(res.data || []);
    } catch (err) {
      console.error("Failed to load pending users", err);
    }
  };

  const handleVerification = async (userId, approved, reason = "") => {
    setLoading(true);
    try {
      await API.put(`/admin/verify-user/${userId}`, {
        approved,
        reason,
      });
      loadPendingUsers(); // Refresh list
      alert(approved ? "User verified successfully!" : "User rejected.");
    } catch (err) {
      alert("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (userId) => {
    handleVerification(userId, true);
  };

  const handleReject = (userId) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      handleVerification(userId, false, reason);
    }
  };

  return (
    <div className="admin-verification-page">
      <h2>Admin Document Verification</h2>
      <p>Review and verify user documents.</p>

      <div className="verification-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Aadhaar</th>
              <th>PAN</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  {user.aadhaarDocUrl && (
                    <a href={user.aadhaarDocUrl} target="_blank" rel="noopener noreferrer">
                      View Aadhaar
                    </a>
                  )}
                </td>
                <td>
                  {user.panDocUrl && (
                    <a href={user.panDocUrl} target="_blank" rel="noopener noreferrer">
                      View PAN
                    </a>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => handleApprove(user.id)}
                    disabled={loading}
                    className="approve-btn"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    disabled={loading}
                    className="reject-btn"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
            {pendingUsers.length === 0 && (
              <tr>
                <td colSpan="6" className="no-data">
                  No pending verifications
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
