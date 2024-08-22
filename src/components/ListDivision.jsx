import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import IconTv from "../assets/icon-tv.svg";
import Search from "../assets/search.svg";
import IconMovie from "../assets/icon-movie.svg";
import IconSeries from "../assets/icon-series.svg";
import IconLogout from "../assets/icon-logout.svg";
import "../Style/ListDivision.scss";

const ListDivision = ({ isFocused }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
    window.location.reload();
  }, [navigate]);

  const listItems = [
    {
      path: "/search",
      icon: Search,
      label: "Search",
    },
    {
      path: "/live",
      icon: IconTv,
      label: "Live TV",
    },
    {
      path: "/movies",
      icon: IconMovie,
      label: "Movies",
    },
    {
      path: "/series",
      icon: IconSeries,
      label: "Series",
    },
    {
      icon: IconLogout,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  const handleArrowDown = useCallback(() => {
    setSelectedIndex((prevIndex) => Math.min(prevIndex + 1, listItems.length - 1));
  }, [listItems.length]);

  const handleArrowUp = useCallback(() => {
    setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  }, []);

  const handleEnter = useCallback(() => {
    const options = ["/search", "/live", "/movies", "/series", handleLogout];
    const selectedOption = options[selectedIndex];

    if (typeof selectedOption === "string") {
      navigate(selectedOption);
    } else if (typeof selectedOption === "function") {
      selectedOption();
    }
  }, [selectedIndex, handleLogout, navigate]);

  const handleKeyDown = useCallback((event) => {
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
  }, [isFocused, handleArrowDown, handleArrowUp, handleEnter]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="list-division">
      {listItems.map((item, index) => (
        <div
          key={index}
          className={`division ${
            selectedIndex === index && isFocused ? "focused" : ""
          } ${location.pathname === item.path ? "selected" : ""}`}
          onClick={() => {
            if (item.onClick) {
              item.onClick();
            } else {
              navigate(item.path);
            }
          }}
          role="button"
          tabIndex={index}
          aria-pressed={selectedIndex === index}
        >
          <img src={item.icon} alt={item.label} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default ListDivision;
