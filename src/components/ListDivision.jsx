import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/logo.png";
import IconTv from "../assets/icon-tv.svg";
import IconMovie from "../assets/icon-movie.svg";
import IconSeries from "../assets/icon-series.svg";
import Profile from "../assets/profile.svg";
import "../Style/ListDivision.scss";

const ListDivision = memo(({ isFocused }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Memoize list items to avoid recreation on every render
  const listItems = useMemo(() => [
    { path: "/", icon: Logo, label: "Home" },
    { path: "/live", icon: IconTv, label: "Live TV" },
    { path: "/movies", icon: IconMovie, label: "Movies" },
    { path: "/series", icon: IconSeries, label: "Series" },
    { path: "/profile", icon: Profile, label: "Profile" },
  ], []);

  const handleKeyDown = useCallback((e) => {
    if (!isFocused) return;
    if (e.key === "ArrowDown") setSelectedIndex((i) => Math.min(i + 1, listItems.length - 1));
    if (e.key === "ArrowUp") setSelectedIndex((i) => Math.max(i - 1, 0));
    if (e.key === "Enter") navigate(listItems[selectedIndex].path);
  }, [isFocused, listItems, selectedIndex, navigate]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <nav className="list-division">
      {listItems.map((item, index) => {
        const isSelected = location.pathname === item.path;
        const isFocusedItem = selectedIndex === index && isFocused;
        return (
          <div
            key={index}
            className={`division${isFocusedItem ? " focused" : ""}${isSelected ? " selected" : ""}`}
            onClick={() => navigate(item.path)}
            role="button"
            tabIndex={0}
          >
            <img src={item.icon} alt="" className="division-icon" />
            <span className="division-label">{item.label}</span>
          </div>
        );
      })}
    </nav>
  );
});

ListDivision.displayName = "ListDivision";

export default ListDivision;
