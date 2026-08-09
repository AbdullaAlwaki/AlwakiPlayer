import { useState, useEffect } from "react";
import ListDivision from "../ListDivision";
import "./UserInfo.scss";

const UserInfo = () => {
  const [isFocused, setIsFocused] = useState(0); // 0 = ListDivision, 1 = Button
  const userInfo =
    JSON.parse(sessionStorage.getItem("currentProfile"))?.user_info || {};

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

    // Redirect to login or home page
    window.location.href = "/login";
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowRight":
          if (isFocused === 0) {
            event.preventDefault();
            setIsFocused(1);
          }
          break;
        case "ArrowLeft":
          if (isFocused === 1) {
            event.preventDefault();
            setIsFocused(0);
          }
          break;
        case "Enter":
          if (isFocused === 1) {
            event.preventDefault();
            handleDeleteProfile();
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [isFocused, handleDeleteProfile]);

  return (
    <div className="user-info-container">
      {/* focus على ListDivision إذا isFocused = 0 */}
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
          type="button"
          className={`delete-profile-btn ${isFocused === 1 ? "focused" : ""}`}
          onClick={handleDeleteProfile}
          aria-label="Delete profile"
        >
          Delete Profile
        </button>
      </div>
    </div>
  );
};

export default UserInfo;
