import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import IconTv from "../assets/icon-tv.svg";
import IconMovie from "../assets/icon-movie.svg";
import IconSeries from "../assets/icon-series.svg";
import IconLogout from "../assets/icon-logout.svg";
import "../Style/ListDivision.scss";

const ListDivision = ({ isFocused }) => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isFocused) {
        switch (event.key) {
          case "ArrowDown":
            handleArrowDown();
            break;
          case "ArrowUp":
            handleArrowUp();
            break;
          case "Enter":
            handleEnter();
            break;
          default:
            break;
        }
      } 
    };

    const handleArrowDown = () => {
      if (selectedIndex < 3) {
        setSelectedIndex(selectedIndex + 1);
      }
    };

    const handleArrowUp = () => {
      if (selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
      }
    };

    const handleEnter = () => {
      /*       if (selectedIndex === 0) {
        navigate('/');
      } else */ if (selectedIndex === 0) {
        navigate("/live");
      } else if (selectedIndex === 1) {
        navigate("/movies");
      } else if (selectedIndex === 2) {
        navigate("/series");
      } else if (selectedIndex === 3) {
        handleLogout();
      }
    };
      const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
    window.location.reload();
  };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, navigate, isFocused]);




  return (
    <div className="list-division">
      {/*       <div
        className={`division ${selectedIndex === 0 && isFocused ? 'selected' : ''}`}
        onClick={() => handleClick(0)}
      >
        <img src={Logo} alt="Logo" />
      </div> */}
      <div
        className={`division ${selectedIndex === 0 && isFocused && "selected"} 
          ${location.pathname === "/live" && "selected"}`}
      >
        <img src={IconTv} alt="Live TV Icon" />
        <span>Live TV</span>
      </div>
      <div
        className={`division ${selectedIndex === 1 && isFocused && "selected"}
        ${location.pathname === "/movies" && "selected"}`}
      >
        <img src={IconMovie} alt="Movie Icon" />
        <span>Movies</span>
      </div>
      <div
        className={`division ${selectedIndex === 2 && isFocused && "selected"} 
          ${location.pathname === "/series" && "selected"}`}
      >
        <img src={IconSeries} alt="Series Icon" />
        <span>Series</span>
      </div>
      <div
        className={`division ${selectedIndex === 3 && isFocused && "selected"}
`}
      >
        <img src={IconLogout} alt="Series Icon" />

        <span>Logout</span>
      </div>
    </div>
  );
};

export default ListDivision;
