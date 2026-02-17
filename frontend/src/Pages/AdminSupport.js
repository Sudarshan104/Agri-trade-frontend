import { useState, useEffect } from "react";
import API from "../Services/api";
import "./AdminSupport.css";

export default function AdminSupport() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [response, setResponse] = useState("");

  useEffect(() => {
    fetchSupportRequests();
  }, []);

  const fetchSupportRequests = async () => {
    try {
      const response = await API.get("/admin/support-requests");
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching support requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId, status) => {
    try {
      await API.put(`/admin/support-requests/${requestId}`, { status });
      fetchSupportRequests();
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  const submitResponse = async (requestId) => {
    if (!response.trim()) return;

    try {
      await API.put(`/admin/support-requests/${requestId}`, {
        adminResponse: response,
      });
      setSelectedRequest(null);
      setResponse("");
      fetchSupportRequests();
    } catch (error) {
      console.error("Error submitting response:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "#f39c12";
      case "IN_PROGRESS":
        return "#3498db";
      case "RESOLVED":
        return "#27ae60";
      case "CLOSED":
        return "#95a5a6";
      default:
        return "#95a5a6";
    }
  };

  if (loading) {
    return <div className="admin-support-container">Loading support requests...</div>;
  }

  return (
    <div className="admin-support-container">
      <h1>Support Requests Management</h1>

      <div className="requests-grid">
        {requests.map((request) => (
          <div key={request.id} className="request-card">
            <div className="request-header">
              <h3>{request.subject}</h3>
              <span
                className="status-badge"
                style={{ backgroundColor: getStatusColor(request.status) }}
              >
                {request.status}
              </span>
            </div>

            <div className="request-meta">
              <p><strong>User:</strong> {request.user.name} ({request.user.email})</p>
              <p><strong>Submitted:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="request-message">
              <p>{request.message}</p>
            </div>

            {request.adminResponse && (
              <div className="admin-response">
                <h4>Admin Response:</h4>
                <p>{request.adminResponse}</p>
              </div>
            )}

            <div className="request-actions">
              {request.status === "PENDING" && (
                <button
                  onClick={() => updateRequestStatus(request.id, "IN_PROGRESS")}
                  className="btn-primary"
                >
                  Start Working
                </button>
              )}

              {request.status === "IN_PROGRESS" && (
                <>
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="btn-secondary"
                  >
                    Respond
                  </button>
                  <button
                    onClick={() => updateRequestStatus(request.id, "RESOLVED")}
                    className="btn-success"
                  >
                    Mark Resolved
                  </button>
                </>
              )}

              {request.status === "RESOLVED" && (
                <button
                  onClick={() => updateRequestStatus(request.id, "CLOSED")}
                  className="btn-secondary"
                >
                  Close Request
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedRequest && (
        <div className="response-modal">
          <div className="modal-content">
            <h3>Respond to Support Request</h3>
            <p><strong>Subject:</strong> {selectedRequest.subject}</p>
            <p><strong>Message:</strong> {selectedRequest.message}</p>

            <textarea
              placeholder="Enter your response..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows="4"
            />

            <div className="modal-actions">
              <button onClick={() => submitResponse(selectedRequest.id)} className="btn-primary">
                Submit Response
              </button>
              <button onClick={() => setSelectedRequest(null)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
