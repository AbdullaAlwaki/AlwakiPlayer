import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../Util/createContext";
import { fetchData } from "../../Util/helperfunction";
import ReactPlayer from "react-player";
import LiveStreamsList from "./LiveStreamsList";
import ListDivision from "../ListDivision";
import "../../Style/live-categories-list.scss";

const LiveCategoriesList = () => {
  const [liveCategories, setLiveCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [url, setUrel] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const navigate = useNavigate();

  const {
    serverUrl,
    username,
    password,
    setError,
    setLoading,
    loading,
    error,
  } = useContext(Context);

  const liveCategoriesLocal = JSON.parse(
    sessionStorage.getItem("liveCategories")
  );

  const favoriteList =
    JSON.parse(localStorage.getItem("favoriteListLive")) || [];

  useEffect(() => {
    if (liveCategoriesLocal) {
      if (liveCategoriesLocal[1].category_name === "Favorites") {
        liveCategoriesLocal[1].count = favoriteList.length;
      }
      setLiveCategories(liveCategoriesLocal);
    } else {
      fetchData(
        setLoading,
        serverUrl,
        username,
        password,
        setLiveCategories,
        setError,
        "live",
        "live_streams"
      );
    }

    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowDown":
          setFocusedIndex((prevIndex) =>
            Math.min(prevIndex + 1, liveCategories.length - 1)
          );
          break;
        case "ArrowUp":
          setFocusedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
          break;
        case "Enter":
          handleCategoryClick(focusedIndex);
          break;
          case 'Backspace' || 8:
            navigate(-1)
break;  default:
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
    liveCategories.length,
    favoriteList.length,
    focusedIndex,
  ]);

  const handleCategoryClick = async (categoryId) => {
    if (selectedCategory !== categoryId) {
      setSelectedCategory(categoryId);
    }
  };

  const fullScreen = () => {
    const elem = document.querySelector(".iptv-player");
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  return (
    <>
    <ListDivision />
    <div className="live-categories-container">
      <div className="live-categories-list">
        <ul className="live-categories">
          {liveCategories?.map((category, index) => (
            <li
              key={category.category_id}
              onClick={() => handleCategoryClick(category.category_id)}
              className={`category-item ${focusedIndex === index ? "focused" : ""}`}
              tabIndex="0"
              onFocus={() => setFocusedIndex(index)}
            >
              <span className="category-name">{category.category_name}</span>
              {category.count && (
                <span className="category-count">{category.count}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      {selectedCategory !== null && (
        <LiveStreamsList
          categoryId={liveCategories[selectedCategory]?.category_id}
          favoriteList={favoriteList}
          setUrel={setUrel}
        />
      )}

      <div
        className="iptv-player"
        onClick={fullScreen}
        tabIndex="0"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            fullScreen();
          }
        }}
      >
        {loading && !error && <div className="loading"></div>}
        {error ? (
          <div>{error.toString()}</div>
        ) : (
          <ReactPlayer
            url={url}
            playing
            width={"100%"}
            height={"100%"}
            onBufferEnd={() => {
              setLoading(false);
              setError(null);
            }}
            onReady={() => {
              setError(null);
              setLoading(true);
            }}
            onBuffer={() => setLoading(true)}
            onEnded={() => setLoading(false)}
            onPause={() => setLoading(false)}
            onError={(error) => {
              setError(`Error loading video: ${error}`);
              console.log("error");
              setLoading(false);
            }}
          />
        )}
      </div>
    </div>
    </>
  );
};

export default LiveCategoriesList;
