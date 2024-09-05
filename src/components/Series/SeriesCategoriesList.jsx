import React, { useState, useEffect, useContext, useRef } from "react";
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
  const { serverUrl, username, password, setError, setLoading } =
    useContext(Context);
  const seriesDataListRef = useRef(null);

  const favoriteList =
    JSON.parse(localStorage.getItem("favoriteListSeries")) || [];

  const seriesCategoriess = JSON.parse(
    sessionStorage.getItem("seriesCategories")
  );

  useEffect(() => {
    if (seriesCategoriess) {
      if (seriesCategoriess[1].category_name === "Favorites") {
        seriesCategoriess[1].count = favoriteList.length;
      }
      setSeriesCategories(seriesCategoriess);
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
    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowDown":
          if (isFocused === 1) {
            setFocusedIndex((prevIndex) =>
              Math.min(prevIndex + 1, seriesCategories.length)
            );
          }
          break;
        case "ArrowUp":
          if (isFocused === 1)
            setFocusedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
          break;
        case "ArrowLeft":
          if (isFocused === 1)
            setIsFocused((prevIndex) => Math.max(prevIndex - 1, 0));
          break;
        case "ArrowRight":
          if ( selectedCategory === seriesCategories[focusedIndex]?.category_id){
          setIsFocused((prevIndex) => Math.min(prevIndex + 1, 2));} else {
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
            setSelectedCategory(null)
            setIsFocused(1)
          break;
        default:
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line
  }, [
    serverUrl,
    username,
    password,
    setLoading,
    setError,
    favoriteList.length,
    focusedIndex,
    isFocused
  ]);

  const handleCategoryClick = async (categoryId) => {
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
  };

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
      <ListDivision isFocused={isFocused === 0}/>
      <div className="series_categories_container">
        <div className="series_categories_list_container">
          <ul className="series_categories">
            {seriesCategories.map((category, index) => (
              <li
                className={`series_category ${
                  focusedIndex === index && isFocused === 1 ? "focused" : ""
                } ${selectedCategory === category.category_id ? "selected" : ""}`}
                key={category.category_id}
                onClick={() => handleCategoryClick(category.category_id)}
              >
                <h1 className="category-name">
                  {category.category_name}
                  <span className="category-count">{category.count}</span>
                </h1>

                {selectedCategory === category.category_id && close && (
                  <div className="series_data_list">
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
