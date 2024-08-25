import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../Util/createContext";
import { fetchData } from "../../Util/helperfunction";
import ReactPlayer from "react-player";
import LiveStreamsList from "./LiveStreamsList";
import ListDivision from "../ListDivision";
import "./live-categories-list.scss";

const LiveCategoriesList = () => {
  const [liveCategories, setLiveCategories] = useState([]);
  const [err, setErr] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [url, setUrel] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(1);
  const navigate = useNavigate();
  const { serverUrl, username, password, setError, setLoading } =
    useContext(Context);

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
          if (isFocused === 1) {
            setFocusedIndex((prevIndex) =>
              Math.min(prevIndex + 1, liveCategories.length)
            );
          }
          break;
        case "ArrowUp":
          if (isFocused === 1)
            setFocusedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
          break;
        case "ArrowLeft":
          setIsFocused((prevIndex) => Math.max(prevIndex - 1, 0));
          break;
        case "ArrowRight":
          setIsFocused((prevIndex) => Math.min(prevIndex + 1, 3));
          break;
        case "Enter":
          if (isFocused === 1) {
            handleCategoryClick(focusedIndex);
            setIsFocused(2);
          }
          if (isFocused === 3) fullScreen();
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
    setError,
    setLoading,
    username,
    focusedIndex,
    /*  liveCategoriesLocal, */
    navigate,
    password,
    liveCategories.length,
    favoriteList.length,
    isFocused,
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
      <ListDivision isFocused={isFocused === 0} />
      <div className="live-categories-container">
        <div className="live-categories-list">
          <ul className="live-categories">
            {liveCategories?.map((category, index) => (
              <li
                key={index}
                onClick={() => handleCategoryClick(index)}
                className={`category-item ${
                  focusedIndex === index && isFocused === 1 ? "focused" : ""
                } ${selectedCategory === index ? "selected" : ""}`}
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
            isFocused={isFocused}
          />
        )}

        {err ?   <div>
          <p> {err}</p>
        </div> : <div
          className={`${isFocused === 3 ? "selected" : ""} iptv-player`}
          onClick={fullScreen}
          tabIndex="0"
        >
          <ReactPlayer
            url={url}
            playing
            width={"100%"}
            height={"100%"}
            onBufferEnd={() => {
              setLoading(false);
              setErr(null);
            }}
            onReady={() => {
              setErr(null);
              setLoading(true);
            }}
            onBuffer={() => setLoading(true)}
            onEnded={() => setLoading(false)}
            onPause={() => setLoading(false)}
            onError={(error) => {
              setErr(`Error loading video: ${error}`);
              console.log("error");
              setLoading(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                fullScreen();
              }
            }}
          />
        </div>}
       
      </div>
    </>
  );
};

export default LiveCategoriesList;
