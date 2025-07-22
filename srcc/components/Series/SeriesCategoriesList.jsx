import React, { useState, useEffect, useContext, useRef, useCallback, useMemo } from "react";
import { Context } from "../../Util/createContext";
import { fetchData } from "../../Util/helperfunction";
import SeriesList from "./SeriesList";
import ListDivision from "../ListDivision";
import "./SeriesList.scss";

const SeriesCategoriesList = () => {
  const [seriesCategories, setSeriesCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [seriesList, setSeriesList] = useState([]);
  const [close, setClose] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(1);
  const { serverUrl, username, password, setError, setLoading } = useContext(Context);
  const seriesDataListRef = useRef(null);
  const itemRefs = useRef([]);

  const favoriteList = useMemo(() => {
    return JSON.parse(localStorage.getItem("favoriteListSeries")) || [];
  }, []); // Now it won't change on every render

  const seriesCategoriess = JSON.parse(sessionStorage.getItem("seriesCategories"));

  useEffect(() => {
    if (seriesCategoriess) {
      // Deep clone to avoid mutating sessionStorage data
      const updated = seriesCategoriess.map((cat, idx) =>
        idx === 1 && cat.category_name === "Favorites"
          ? { ...cat, count: favoriteList.length }
          : cat
      );
      // Only update if changed
      setSeriesCategories((prev) => {
        if (
          prev.length === updated.length &&
          prev.every((cat, i) => cat.count === updated[i].count)
        ) {
          return prev;
        }
        return updated;
      });
    } else {
      fetchData(
        setLoading,
        serverUrl,
        username,
        password,
        setSeriesCategories,
        setError,
        "series",
        "series"
      );
    }
  }, [seriesCategoriess, favoriteList.length, serverUrl, username, password, setLoading, setError]);

  const handleCategoryClick = useCallback(async (categoryId) => {
    if (categoryId === "1") {
      setSeriesList(favoriteList);
      setSelectedCategory(categoryId);
      setClose(true);
      return;
    }
    setSelectedCategory(categoryId);
    try {
      const response = await fetch(
        `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_series&category_id=${categoryId}`
      );
      const data = await response.json();
      setSeriesList(data);
      setClose(true);
    } catch (error) {
      setError("Error fetching series list:", error);
    }
  }, [serverUrl, username, password, setError, favoriteList]);

  const handleKeyDown = useCallback((event) => {
    // Prevent default behavior for navigation keys
    if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Enter", "Backspace"].includes(event.key)) {
      event.preventDefault();
    }

    switch (event.key) {
      case "ArrowDown":
        if (isFocused === 1) {
          setFocusedIndex((prevIndex) => {
            const newIndex = Math.min(prevIndex + 1, seriesCategories.length - 1);
            // Smooth scroll into view
            itemRefs.current[newIndex]?.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });
            return newIndex;
          });
        }
        break;
      case "ArrowUp":
        if (isFocused === 1) {
          setFocusedIndex((prevIndex) => {
            const newIndex = Math.max(prevIndex - 1, 0);
            // Smooth scroll into view
            itemRefs.current[newIndex]?.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });
            return newIndex;
          });
        }
        break;
      case "ArrowLeft":
        if (isFocused === 1) {
          setIsFocused((prevIndex) => Math.max(prevIndex - 1, 0));
        }
        break;
      case "ArrowRight":
        if (selectedCategory === seriesCategories[focusedIndex]?.category_id) {
          setIsFocused((prevIndex) => Math.min(prevIndex + 1, 2));
        } else {
          setIsFocused((prevIndex) => Math.min(prevIndex + 1, 1));
        }
        break;
      case "Enter":
        if (isFocused === 1) {
          handleCategoryClick(seriesCategories[focusedIndex]?.category_id);
          setIsFocused(2);
        }
        break;
      case "Backspace":
        setSelectedCategory(null);
        setIsFocused(1);
        break;
      default:
        break;
    }
  }, [isFocused, focusedIndex, seriesCategories, selectedCategory, handleCategoryClick]);

  useEffect(() => {
    // Use capture phase to handle events before they bubble
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [handleKeyDown]);

  const handleClickOutside = (event) => {
    if (
      seriesDataListRef.current &&
      !seriesDataListRef.current.contains(event.target)
    ) {
      setClose(false);
    }
  };

  useEffect(() => {
    if (close) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [close]);

  return (
    <>
      <ListDivision isFocused={isFocused === 0} />
      <div className="series_categories_container" role="region" aria-label="Series Categories">
        <div className="series_categories_list_container">
          <ul className="series_categories" role="listbox" aria-activedescendant={`series-category-${focusedIndex}`} tabIndex="0">
            {seriesCategories.map((category, index) => (
              <li
                ref={el => (itemRefs.current[index] = el)}
                className={`series_category ${
                  focusedIndex === index && isFocused === 1 ? "focused" : ""
                } ${selectedCategory === category.category_id ? "selected" : ""}`}
                key={category.category_id}
                onClick={() => handleCategoryClick(category.category_id)}
                role="option"
                aria-selected={selectedCategory === category.category_id}
                id={`series-category-${index}`}
                tabIndex={focusedIndex === index && isFocused === 1 ? 0 : -1}
              >
                <h1 className="category-name">
                  {category.category_name}
                  <span className="category-count" aria-label={`${category.count} items`}>
                    {category.count}
                  </span>
                </h1>

                {selectedCategory === category.category_id && close && (
                  <div className="series_data_list" role="region" aria-label="Series List">
                    <div ref={seriesDataListRef}>
                      <SeriesList seriesList={seriesList} isFocused={isFocused} />
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default SeriesCategoriesList;
