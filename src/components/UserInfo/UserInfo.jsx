import { useState, useEffect, useMemo } from "react";
import ListDivision from "../ListDivision";
import "./UserInfo.scss";

const UserInfo = () => {
  const [isFocused, setIsFocused] = useState(0);
  
  // Memoize user info parsing to avoid recalculation
  const userInfo = useMemo(() => {
    const profile = JSON.parse(sessionStorage.getItem("currentProfile"));
    return profile?.user_info || {};
  }, []);

  if (!userInfo || Object.keys(userInfo).length === 0) {
    return (
      <div className="user-info-error">No user information available.</div>
    );
  }

  const handleDeleteProfile = () => {
    const currentProfile = JSON.parse(sessionStorage.getItem("currentProfile"));
    const profiles = JSON.parse(localStorage.getItem("user")) || [];

    const updatedProfiles = profiles.filter(
      (profile) => profile.profile !== currentProfile.profile
    );

    localStorage.setItem("user", JSON.stringify(updatedProfiles));
    sessionStorage.removeItem("currentProfile");

    window.location.href = "/login";
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowRight":
          if (isFocused === 0) setIsFocused(1);
          break;
        case "ArrowLeft":
          if (isFocused === 1) setIsFocused(0);
          break;
        case "Enter":
          if (isFocused === 1) {
            handleDeleteProfile();
          }
          break;
        default:
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFocused]);

  return (
    <div className="user-info-container">
      <ListDivision isFocused={isFocused === 0} />

      <div className="user-info-card">
        <h2>User Info</h2>
        <div className="user-info-details">
          <p>
            <strong>Status:</strong> {userInfo.status}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {userInfo.created_at
              ? new Date(userInfo.created_at * 1000).toLocaleDateString()
              : "-"}
          </p>
          <p>
            <strong>Expiration Date:</strong>{" "}
            {userInfo.exp_date === null
              ? "Never"
              : userInfo.exp_date
              ? new Date(userInfo.exp_date * 1000).toLocaleDateString()
              : "-"}
          </p>
          <p>
            <strong>Is Trial:</strong> {userInfo.is_trial == "0" ? "No" : "Yes"}
          </p>
          <p>
            <strong>Active Connections:</strong> {userInfo.active_cons}
          </p>
          <p>
            <strong>Max Connections:</strong> {userInfo.max_connections}
          </p>
        </div>
        <p className="user-info-note">
          Note: This information is retrieved from the current profile session.
        </p>
      </div>

      <div>
        <button
          className={`delete-profile-btn ${isFocused === 1 ? "focused" : ""}`}
          onClick={handleDeleteProfile}
        >
          Delete Profile
        </button>
      </div>
    </div>
  );
};

export default UserInfo;
