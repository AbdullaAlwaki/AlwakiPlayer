import React, { useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../Util/createContext";
import addProfileIcon from "../../assets/add-group.png";
import profileIcon from "../../assets/profile.png";

import "./Home.scss";

export default function Home() {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { setServerUrl, setUsername, setPassword, setName } =
    useContext(Context);
    console.log(setServerUrl, setUsername, setPassword, setName);
    
  const navigate = useNavigate();

  const profile = JSON.parse(localStorage.getItem("user"));
  console.log("profile", profile);
  

  const user = useCallback((e) => {
    sessionStorage.clear();
    setServerUrl(
      `${e?.server_info.server_protocol}://${e?.server_info.url}:${e?.server_info.port}`
    );
    setUsername(e?.user_info.username);
    setPassword(e?.user_info.password);
    setName(e?.profile);
    navigate("/live");
  }, [setUsername, setServerUrl, navigate, setName, setPassword])


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
  return (
    <div className="iptv-container">
      <h1>Welcome to Alwaki Player</h1>
      <div className="profile_con">
        {profile?.map((prof, i) => (
          <div
            className={`profile_card ${focusedIndex === i ? "selected" : ""}`}
            key={i}
            onClick={() => user(prof)}
          >
            <img src={profileIcon} alt={prof.name} />
            <h2>{prof.profile}</h2>
          </div>
        ))}

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

