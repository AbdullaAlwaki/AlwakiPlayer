import "./UserInfo.scss";

const UserInfo = () => {
  /*  const { status, exp_date, is_trial, active_cons, created_at, max_connections } = userInfo.user_info; */
  const userInfo =
    JSON.parse(sessionStorage.getItem("currentProfile"))?.user_info || {};

  if (!userInfo) {
    return (
      <div className="user-info-error">
        No user information available.
      </div>
    );
  }
  if (Object.keys(userInfo).length === 0) {
    return (
      <div className="user-info-error">
        No user information available.
      </div>
    );
  }

  const handleDeleteProfile = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this profile? This action cannot be undone."
      )
    ) {
      const currentProfile = JSON.parse(
        sessionStorage.getItem("currentProfile")
      );
      const profiles = JSON.parse(localStorage.getItem("user")) || [];
      console.log("Current Profile:", profiles[1].profile !== currentProfile.profile);
      
      const updatedProfiles = profiles.filter(
        (profile) => profile.profile !== currentProfile.profile
      );
      console.log("Updated Profiles:", updatedProfiles);
      
      localStorage.setItem("user", JSON.stringify(updatedProfiles));
      sessionStorage.removeItem("currentProfile");
    }
    window.location.reload(); // Reload the page to reflect changes
  };

  return (
    <div className="user-info-container">
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
        <button className="delete-profile-btn" onClick={handleDeleteProfile}>
          Delete Profile
        </button>
      </div>
    </div>
  );
};

export default UserInfo;
