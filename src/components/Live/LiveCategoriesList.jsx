import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../Util/createContext";
import Player from "../../Util/Player";
import LiveStreamsList from "./LiveStreamsList";
import "../../Style/live-categories-list.scss";

const LiveCategoriesList = () => {
  const [liveCategories, setLiveCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { serverUrl, username, password, setError, setLoading, loading } = useContext(Context);

  const liveCategoriesLocal = JSON.parse(
    sessionStorage.getItem("liveCategories")
  );
  useEffect(() => {
    if (liveCategoriesLocal) {
      if (liveCategoriesLocal[1].category_name === "Favorites") {
        liveCategoriesLocal[1].count = Object.keys(
          JSON.parse(localStorage.getItem("favoriteListLive")) || {}
        ).length;
      }
      setLiveCategories(liveCategoriesLocal);
    } else {
      const fetchLiveData = async () => {
        setLoading(true);
        try {
          const liveCategoriesResponse = await fetch(
            `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_categories`
          );
          const liveCategoriesData = await liveCategoriesResponse.json();
          setLiveCategories(liveCategoriesData);
          liveCategoriesData.unshift(
            { category_id: "0", category_name: "All" },
            { category_id: "1", category_name: "Favorites" }
          );
  
          const fetchCountForCategory = async (category) => {
            try {
              const response = await fetch(
                `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams&category_id=${category.category_id}`
              );
              const data = await response.json();
              return data.length;
            } catch (error) {
              setError("Error fetching movies count for category:", error);
            }
          };
  
          const liveAllStreamsData = await Promise.all(
            liveCategoriesData.map(async (category) => {
              const count = await fetchCountForCategory(category);
              return { [category.category_id]: count };
            })
          );
  
          const liveCategoryWithCount = liveCategoriesData.map((category) => {
            const count = liveAllStreamsData.find(
              (count) => category.category_id in count
            )[category.category_id];
            return { ...category, count: count };
          });
  
          sessionStorage.setItem(
            "liveCategories",
            JSON.stringify(liveCategoryWithCount)
          );
          setLiveCategories(liveCategoryWithCount);
          setLoading(false);

        } catch (error) {
          setError(error);
        }
      };

      fetchLiveData();
    }
    // eslint-disable-next-line
  }, [serverUrl, username, password]);
  const handleCategoryClick = async (categoryId) => {
    if (selectedCategory !== categoryId) {
      setSelectedCategory(categoryId);
    }
  };

  return (
    <div className="live-categories-container">
      <div className="live-categories-list">
        <ul className="live-categories">
          {liveCategories?.map((category) => (
            <li
              key={category.category_id}
              onClick={() => handleCategoryClick(category.category_id)}
              className="category-item"
            >
              <span className="category-name">{category.category_name}</span>
              {category.count && (
                <span className="category-count">{category.count}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      {selectedCategory && <LiveStreamsList categoryId={selectedCategory} />}

      <div className="iptv-player">
        <Player />
      </div>
    </div>
  );
};

export default LiveCategoriesList;
