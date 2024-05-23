import React, { useState, useEffect, useContext } from "react";
import { Context } from "../Util/createContext";
import ReactPlayer from "react-player";
import LiveStreamsList from "./LiveStreamsList";
import "../Style/live-categories-list.scss";

const LiveCategoriesList = () => {
  const [liveCategories, setLiveCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { serverUrl, username, password, urlPlayer } = useContext(Context);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const liveCategoriesResponse = await fetch(
          `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_categories`
        );
        const liveCategoriesData = await liveCategoriesResponse.json();
        // add allLiveStreamsData to liveCategoriesData
        liveCategoriesData.unshift({ category_id: "0", category_name: "All" });
        setLiveCategories(liveCategoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [serverUrl, username, password]);
  const handleCategoryClick = async (categoryId) => {
    if (selectedCategory !== categoryId) {
      setSelectedCategory(categoryId);
    }
  };

  const fullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      const elem = document.querySelector(".iptv-player");
      elem.requestFullscreen();
    }
  };
  return (
    <div className="live-categories-container">
      <div className="live-categories-list">
        <ul className="live-categories">
          {liveCategories.map((category) => (
            <li
              key={category.category_id}
              onClick={() => handleCategoryClick(category.category_id)}
              className="category-item"
            >
              {category.category_name}
            </li>
          ))}
        </ul>
      </div>
      {selectedCategory && <LiveStreamsList categoryId={selectedCategory} />}

      <div className="iptv-player" onClick={fullScreen}>
        {urlPlayer ? (
          <ReactPlayer
            url={urlPlayer}
            playing
            width={"100%"}
            height={"100%"}
            thumbnail="https://alwakistore.onrender.com/static/media/logo.9c361039574df7e0f672.png"
          />
        ) : (
          <img
            src="https://alwakistore.onrender.com/static/media/logo.9c361039574df7e0f672.png"
            alt=""
          />
        )}
      </div>
    </div>
  );
};

export default LiveCategoriesList;
