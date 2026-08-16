import React, { useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../Util/createContext";
import addProfileIcon from "../../assets/add-group.png";
import profileIcon from "../../assets/profile.png";

import "./Home.scss";

export default function Home() {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [editProfileIndex, setEditProfileIndex] = useState(null); // Track which profile is being edited
  const [editData, setEditData] = useState({}); // Store editable data
  const { setServerUrl, setUsername, setPassword, setName } =
    useContext(Context);

  const navigate = useNavigate();

  const profile = JSON.parse(localStorage.getItem("user"));

  const user = useCallback(
    (e) => {
      sessionStorage.clear();
      sessionStorage.setItem("currentProfile", JSON.stringify(e));
      setServerUrl(
        `${e?.server_info.server_protocol}://${e?.server_info.url}:${e?.server_info.port}`
      );
      setUsername(e?.user_info.username);
      setPassword(e?.user_info.password);
      setName(e?.profile);
      navigate("/live");
    },
    [setUsername, setServerUrl, navigate, setName, setPassword]
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowRight":
        case 39:
          setFocusedIndex((prevIndex) =>
            Math.min(prevIndex + 1, profile?.length)
          );
          break;
        case "ArrowLeft":
        case 37:
          setFocusedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
          break;
        case "Enter":
        case 13:
          handleEnter();
          break;
        case "Backspace":
        case 8:
          navigate(-1);
          break;
        default:
          break;
      }
    };

    const handleEnter = () => {
      if (!profile || profile.length <= focusedIndex) {
        navigate("/login");
        return;
      }
      user(profile[focusedIndex]);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profile, focusedIndex, navigate, user]);

  const addProfile = () => {
    navigate("/login");
  };

  const handleEditClick = (i) => {
    setEditProfileIndex(i);
    setEditData(profile[i]);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSave = () => {
    const updatedProfiles = [...profile];
    updatedProfiles[editProfileIndex] = editData;
    localStorage.setItem("user", JSON.stringify(updatedProfiles));
    setEditProfileIndex(null);
  };

  const handleEditCancel = () => {
    setEditProfileIndex(null);
  };

  return (
    <div className="iptv-container">
      <h1>Welcome to Alwaki Player</h1>
      <div className="profile_con">
        {profile?.map((prof, i) => {
          let pressTimer;
          const isEditing = editProfileIndex === i;
          return (
            <div
              className={`profile_card ${focusedIndex === i ? "selected" : ""}`}
              key={i}
              onClick={(e) => {
                // Only allow click if not editing and click is inside the card
                if (!isEditing && e.target === e.currentTarget) {
                  user(prof);
                }
              }}
              style={{ position: "relative" }}
              onMouseDown={(e) => {
                if (!isEditing) {
                  pressTimer = setTimeout(() => handleEditClick(i), 600);
                }
              }}
              onMouseUp={() => clearTimeout(pressTimer)}
              onMouseLeave={() => clearTimeout(pressTimer)}
              onTouchStart={(e) => {
                if (!isEditing) {
                  pressTimer = setTimeout(() => handleEditClick(i), 600);
                }
              }}
              onTouchEnd={() => clearTimeout(pressTimer)}
              onTouchCancel={() => clearTimeout(pressTimer)}
            >
              <img src={profileIcon} alt={prof.name} />
              <h2>{prof.profile}</h2>
              {isEditing && (
                <>
                  {/* Modal background overlay to block outside clicks */}
                  <div
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      width: "100vw",
                      height: "100vh",
                      background: "rgba(0,0,0,0.2)",
                      zIndex: 9,
                    }}
                    onClick={handleEditCancel}
                  />
                  <div
                    className="edit-profile-modal"
                    style={{
                      position: "absolute",
                      top: 40,
                      right: 10,
                      background: "#23283a",
                      color: "#fff",
                      padding: 20,
                      borderRadius: 8,
                      zIndex: 10,
                      minWidth: 220,
                    }}
                  >
                    <label style={{ display: "block", marginBottom: 8 }}>
                      Name:
                      <input
                        name="profile"
                        value={editData.profile || ""}
                        onChange={handleEditChange}
                        style={{
                          width: "100%",
                          marginTop: 4,
                          marginBottom: 12,
                        }}
                      />
                    </label>
                    <label style={{ display: "block", marginBottom: 8 }}>
                      Username:
                      <input
                        name="user_info.username"
                        value={editData.user_info?.username || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            user_info: {
                              ...editData.user_info,
                              username: e.target.value,
                            },
                          })
                        }
                        style={{
                          width: "100%",
                          marginTop: 4,
                          marginBottom: 12,
                        }}
                      />
                    </label>
                    <label style={{ display: "block", marginBottom: 8 }}>
                      Password:
                      <input
                        name="user_info.password"
                        type="password"
                        value={editData.user_info?.password || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            user_info: {
                              ...editData.user_info,
                              password: e.target.value,
                            },
                          })
                        }
                        style={{
                          width: "100%",
                          marginTop: 4,
                          marginBottom: 12,
                        }}
                      />
                    </label>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        onClick={handleEditSave}
                        style={{
                          background: "#4f8cff",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          padding: "6px 14px",
                          cursor: "pointer",
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleEditCancel}
                        style={{
                          background: "#888",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          padding: "6px 14px",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}

        <div
          className={`profile_card 
            ${focusedIndex === profile?.length && "selected"}
            ${!profile?.length && "selected"}`}
          onClick={addProfile}
        >
          <img src={addProfileIcon} alt={profile?.name} />
        </div>
      </div>
    </div>
  );
}
