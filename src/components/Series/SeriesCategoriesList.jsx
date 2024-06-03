import React, { useState, useEffect, useContext, useRef } from "react";
import { Context } from "../../Util/createContext";
import SeriesList from "./SeriesList";
import "../../Style/SeriesList.scss";

const SeriesCategoriesList = () => {
  const [seriesCategories, setSeriesCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [seriesList, setSeriesList] = useState([]);
  const [close, setClose] = useState(false);
  const { serverUrl, username, password, setError, setLoading } =
    useContext(Context);

  const favoriteList =
    JSON.parse(localStorage.getItem("favoriteListSeries")) || [];

  const seriesCategoriess = JSON.parse(
    sessionStorage.getItem("seriesCategories")
  );

  const seriesDataListRef = useRef(null);

  useEffect(() => {
    const fetchSeriesData = async () => {
      try {
        setLoading(true);
        const seriesCategoriesResponse = await fetch(
          `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_series_categories`
        );
        const seriesCategoriesData = await seriesCategoriesResponse.json();
        seriesCategoriesData.unshift(
          { category_id: "0", category_name: "All" },
          { category_id: "1", category_name: "Favorites" }
        );
        setSeriesCategories(seriesCategoriesData);

        const fetchCountForCategory = async (category) => {
          try {
            const response = await fetch(
              `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_series&category_id=${category.category_id}`
            );
            const data = await response.json();
            return data.length;
          } catch (error) {
            setError("Error fetching movies count for category:", error);
          }
        };

        const seriesAllStreamsData = await Promise.all(
          seriesCategoriesData.map(async (category) => {
            const count = await fetchCountForCategory(category);
            return { [category.category_id]: count };
          })
        );

        const seriesCategoryWithCount = seriesCategoriesData.map((category) => {
          const count = seriesAllStreamsData.find(
            (count) => category.category_id in count
          )[category.category_id];
          return { ...category, count: count };
        });
        sessionStorage.setItem(
          "seriesCategories",
          JSON.stringify(seriesCategoryWithCount)
        );
        setSeriesCategories(seriesCategoryWithCount);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (seriesCategoriess) {
      if (seriesCategoriess[1].category_name === "Favorites") {
        seriesCategoriess[1].count = favoriteList.length;
      }
      setSeriesCategories(seriesCategoriess);
    } else {
      fetchSeriesData();
    }
  }, [
    serverUrl,
    username,
    password,
    setLoading,
    setError,
    favoriteList.length,
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
    <div className="series_categories_container">
      <div className="series_categories_list_container">
        <ul className="series_categories">
          {seriesCategories.map((category) => (
            <li
              className="series_category"
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
                    <SeriesList seriesList={seriesList} />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SeriesCategoriesList;
