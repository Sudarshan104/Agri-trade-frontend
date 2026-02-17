import { useEffect, useState } from "react";
import API from "../Services/api";
import { getUser } from "../utils/Auth";

export default function FarmerProfile() {
  const user = getUser();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    address: ""
  });

  useEffect(() => {
    API.get(`/api/admin/profile/${user.id}`).then(res => {
      setProfile(res.data);
    });
  }, [user.id]);

  const updateProfile = async () => {
    try {
      await API.put(`/api/users/${user.id}`, profile);
      alert("Profile updated successfully");
    } catch {
      alert("Failed to update profile");
    }
  };

  return (
    <div className="content-card">
      <h2>Farmer Profile</h2>

      <input
        value={profile.name || ""}
        onChange={e => setProfile({ ...profile, name: e.target.value })}
        placeholder="Name"
      />

      <input
        value={profile.email || ""}
        disabled
      />

      <input
        value={profile.address || ""}
        onChange={e => setProfile({ ...profile, address: e.target.value })}
        placeholder="Farm Location / Village"
      />

      <button onClick={updateProfile}>Save</button>
    </div>
  );
}
