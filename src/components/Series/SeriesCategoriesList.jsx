import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../Util/createContext";
import SeriesList from "./SeriesList";
import "../../Style/SeriesList.scss";

const SeriesCategoriesList = () => {
  const [seriesCategories, setSeriesCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [seriesList, setSeriesList] = useState([]);
  const { serverUrl, username, password, setError } = useContext(Context);

  useEffect(() => {
    const seriesCategories = JSON.parse(
      sessionStorage.getItem("seriesCategories")
    );
    if (seriesCategories) {
      setSeriesCategories(seriesCategories);
      return;
    } else {
      const fetchSeriesData = async () => {
        try {
          const seriesCategoriesResponse = await fetch(
            `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_series_categories`
          );
          const seriesCategoriesData = await seriesCategoriesResponse.json();
          seriesCategoriesData.unshift(
            { category_id: "0", category_name: "All" },
            { category_id: "1", category_name: "Favorites" }
          );

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

          const seriesCategoryWithCount = seriesCategoriesData.map(
            (category) => {
              const count = seriesAllStreamsData.find(
                (count) => category.category_id in count
              )[category.category_id];
              return { ...category, count: count };
            }
          );
          sessionStorage.setItem(
            "seriesCategories",
            JSON.stringify(seriesCategoryWithCount)
          );
          setSeriesCategories(seriesCategoryWithCount);
        } catch (error) {
          setError(error);
        }
      };
      fetchSeriesData();
    }
  }, [serverUrl, username, password]);

  const handleCategoryClick = async (categoryId) => {
    setSelectedCategory(categoryId);
    const url = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_series&category_id=${categoryId}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      setSeriesList(data);
    } catch (error) {
      console.error("Error fetching series list:", error);
    }
  };
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

              {selectedCategory === category.category_id && (
                <SeriesList seriesList={seriesList} />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SeriesCategoriesList;
