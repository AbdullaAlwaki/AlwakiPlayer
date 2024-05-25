import React, { useState, useEffect, useContext } from "react";
import { Context } from "../Util/createContext";
import Player from "../Util/Player";
import LiveStreamsList from "./LiveStreamsList";
import "../Style/live-categories-list.scss";

const LiveCategoriesList = () => {
  const [liveCategories, setLiveCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [liveStreamsData, setLiveStreamsData] = useState([]);
  const {
    serverUrl,
    username,
    password,
    urlPlayer,
    setError,
    error,
    setLoading,
    loading,
  } = useContext(Context);

  useEffect(() => {
    const liveCategoriesLocal = JSON.parse(
      sessionStorage.getItem("liveCategories"));
    if (liveCategoriesLocal) {
      setLiveCategories(liveCategoriesLocal);
    }

    fetch(
      `${serverUrl}/player_api.php?username=${username}&password=${password}&&action=get_live_streams`
    )
      .then((response) => response.json())
      .then((data) => {
        setLiveStreamsData(data);
      });
  }, []);
  const handleCategoryClick = async (categoryId) => {
    if (selectedCategory !== categoryId) {
      setSelectedCategory(categoryId);
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

      <div className="iptv-player">
          <Player
            urlPlayer={urlPlayer}
            setLoading={setLoading}
            setError={setError}
          />
      </div>
    </div>
  );
};

export default LiveCategoriesList;
