import { useEffect, useState } from "react";
import API from "../Services/api";
import "./AdminUsers.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await API.delete(`/admin/users/${id}`);
      loadUsers();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const resetPassword = async (id) => {
    if (!window.confirm("Reset password to '123456'?")) return;
    try {
      await API.put(`/admin/users/${id}/reset-password`);
      alert("Password reset to 123456");
    } catch (err) {
      console.error(err);
      alert("Failed to reset password");
    }
  };

  return (
    <div className="admin-page">
      <h2 className="page-title">Manage Users</h2>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td className={`role ${u.role.toLowerCase()}`}>{u.role}</td>
                <td>
                  <button
                    className="danger-btn"
                    onClick={() => deleteUser(u.id)}
                  >
                    Delete
                  </button>
                  <button
                    className="edit-btn"
                    style={{ marginLeft: "10px", backgroundColor: "#f39c12" }}
                    onClick={() => resetPassword(u.id)}
                  >
                    Reset Pass
                  </button>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan="4" className="empty">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
