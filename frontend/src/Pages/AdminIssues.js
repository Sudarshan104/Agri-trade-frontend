import { useState, useEffect } from "react";
import API from "../Services/api";
import "./AdminIssues.css";

export default function AdminIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [response, setResponse] = useState("");

  useEffect(() => {
    fetchIssueReports();
  }, []);

  const fetchIssueReports = async () => {
    try {
      const response = await API.get("/admin/issue-reports");
      setIssues(response.data);
    } catch (error) {
      console.error("Error fetching issue reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateIssueStatus = async (issueId, status) => {
    try {
      await API.put(`/admin/issue-reports/${issueId}`, { status });
      fetchIssueReports();
    } catch (error) {
      console.error("Error updating issue status:", error);
    }
  };

  const submitResponse = async (issueId) => {
    if (!response.trim()) return;

    try {
      await API.put(`/admin/issue-reports/${issueId}`, {
        adminResponse: response,
      });
      setSelectedIssue(null);
      setResponse("");
      fetchIssueReports();
    } catch (error) {
      console.error("Error submitting response:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "#e74c3c";
      case "IN_PROGRESS":
        return "#f39c12";
      case "RESOLVED":
        return "#27ae60";
      case "CLOSED":
        return "#95a5a6";
      default:
        return "#95a5a6";
    }
  };

  if (loading) {
    return <div className="admin-issues-container">Loading issue reports...</div>;
  }

  return (
    <div className="admin-issues-container">
      <h1>Issue Reports Management</h1>

      <div className="issues-grid">
        {issues.map((issue) => (
          <div key={issue.id} className="issue-card">
            <div className="issue-header">
              <h3>{issue.subject}</h3>
              <span
                className="status-badge"
                style={{ backgroundColor: getStatusColor(issue.status) }}
              >
                {issue.status}
              </span>
            </div>

            <div className="issue-meta">
              <p><strong>User:</strong> {issue.user.name} ({issue.user.email})</p>
              <p><strong>Reported:</strong> {new Date(issue.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="issue-description">
              <p>{issue.description}</p>
            </div>

            {issue.adminResponse && (
              <div className="admin-response">
                <h4>Admin Response:</h4>
                <p>{issue.adminResponse}</p>
              </div>
            )}

            <div className="issue-actions">
              {issue.status === "OPEN" && (
                <button
                  onClick={() => updateIssueStatus(issue.id, "IN_PROGRESS")}
                  className="btn-primary"
                >
                  Start Working
                </button>
              )}

              {issue.status === "IN_PROGRESS" && (
                <>
                  <button
                    onClick={() => setSelectedIssue(issue)}
                    className="btn-secondary"
                  >
                    Respond
                  </button>
                  <button
                    onClick={() => updateIssueStatus(issue.id, "RESOLVED")}
                    className="btn-success"
                  >
                    Mark Resolved
                  </button>
                </>
              )}

              {issue.status === "RESOLVED" && (
                <button
                  onClick={() => updateIssueStatus(issue.id, "CLOSED")}
                  className="btn-secondary"
                >
                  Close Issue
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedIssue && (
        <div className="response-modal">
          <div className="modal-content">
            <h3>Respond to Issue Report</h3>
            <p><strong>Subject:</strong> {selectedIssue.subject}</p>
            <p><strong>Description:</strong> {selectedIssue.description}</p>

            <textarea
              placeholder="Enter your response..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows="4"
            />

            <div className="modal-actions">
              <button onClick={() => submitResponse(selectedIssue.id)} className="btn-primary">
                Submit Response
              </button>
              <button onClick={() => setSelectedIssue(null)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
