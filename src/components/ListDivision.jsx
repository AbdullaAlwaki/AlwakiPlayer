import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import IconTv from "../assets/icon-tv.svg";
import Search from "../assets/search.svg";
import IconMovie from "../assets/icon-movie.svg";
import IconSeries from "../assets/icon-series.svg";
import IconLogout from "../assets/icon-logout.svg";
import Logo from "../assets/logo.png";
import "../Style/ListDivision.scss";

const ListDivision = ({ isFocused }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [ripple, setRipple] = useState({});

  const handleLogout = useCallback(() => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
    window.location.reload();
  }, [navigate]);

  const listItems = useMemo(
    () => [
      {
        path: "/",
        icon: Logo,
        label: "Home",
        tooltip: "Go to home page",
      },
      {
        path: "/search",
        icon: Search,
        label: "Search",
        tooltip: "Search content",
      },
      {
        path: "/live",
        icon: IconTv,
        label: "Live TV",
        tooltip: "Watch live channels",
      },
      {
        path: "/movies",
        icon: IconMovie,
        label: "Movies",
        tooltip: "Browse movies",
      },
      {
        path: "/series",
        icon: IconSeries,
        label: "Series",
        tooltip: "Browse series",
      },
      {
        icon: IconLogout,
        label: "Logout",
        onClick: handleLogout,
        tooltip: "Logout from your account",
      },
    ],
    [handleLogout]
  );

  const handleArrowDown = useCallback(() => {
    setSelectedIndex((prevIndex) => Math.min(prevIndex + 1, listItems.length - 1));
  }, [listItems.length]);

  const handleArrowUp = useCallback(() => {
    setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  }, []);

  const handleEnter = useCallback(() => {
    const selectedItem = listItems[selectedIndex];
    if (selectedItem.onClick) {
      selectedItem.onClick();
    } else if (selectedItem.path) {
      navigate(selectedItem.path);
    }
  }, [selectedIndex, listItems, navigate]);

  const handleKeyDown = useCallback(
    (event) => {
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
    },
    [isFocused, handleArrowDown, handleArrowUp, handleEnter]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Ripple effect for click feedback
  const handleRipple = (e, index) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    setRipple({ [index]: { x, y, size, show: true } });
    setTimeout(() => setRipple({}), 400);
  };

  return (
    <nav className="list-division" aria-label="Main navigation">
      {listItems.map((item, index) => {
        const isSelected = location.pathname === item.path;
        const isFocusedItem = selectedIndex === index && isFocused;
        return (
          <div
            key={index}
            className={`division${isFocusedItem ? " focused" : ""}${isSelected ? " selected" : ""}`}
            onClick={(e) => {
              handleRipple(e, index);
              if (item.onClick) {
                item.onClick();
              } else if (item.path) {
                navigate(item.path);
              }
            }}
            role="button"
            tabIndex={0}
            aria-pressed={isFocusedItem}
            aria-current={isSelected ? "page" : undefined}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                if (item.onClick) {
                  item.onClick();
                } else if (item.path) {
                  navigate(item.path);
                }
              }
            }}
            title={item.tooltip}
            style={{ position: "relative", overflow: "hidden" }}
          >
            {ripple[index]?.show && (
              <span
                className="ripple"
                style={{
                  left: ripple[index].x,
                  top: ripple[index].y,
                  width: ripple[index].size,
                  height: ripple[index].size,
                }}
              />
            )}
            <img
              src={item.icon}
              alt=""
              aria-hidden="true"
              className="division-icon"
            />
            <span className="division-label">{item.label}</span>
          </div>
        );
      })}
    </nav>
  );
};

export default ListDivision;
