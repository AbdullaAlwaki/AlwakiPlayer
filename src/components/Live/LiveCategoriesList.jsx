import { useState, useEffect, useContext, useCallback, useRef } from "react";
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
  const [videoLoading, setVideoLoading] = useState(false);
  const itemRefs = useRef([]);
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
    // eslint-disable-next-line
  }, [
    serverUrl,
    setError,
    setLoading,
    username,
    password,
    liveCategories.length,
    favoriteList.length,
  ]);

  const handleCategoryClick = useCallback((categoryId) => {
    // If clicking the same category that's already open, close it
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      return;
    }
    setSelectedCategory(categoryId);
  }, [selectedCategory]);

  const fullScreen = useCallback(() => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Add default case to switch statement
  const handleKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case "ArrowDown":
          if (isFocused === 1) {
            setFocusedIndex((prevIndex) => {
              const newIndex = Math.min(
                prevIndex + 1,
                liveCategories.length - 1
              );
              // Scroll into view
              if (itemRefs.current[newIndex]) {
                itemRefs.current[newIndex].scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
              return newIndex;
            });
          }
          break;
        case "ArrowUp":
          if (isFocused === 1) {
            setFocusedIndex((prevIndex) => {
              const newIndex = Math.max(prevIndex - 1, 0);
              // Scroll into view
              if (itemRefs.current[newIndex]) {
                itemRefs.current[newIndex].scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
              return newIndex;
            });
          }
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
        case "f":
          fullScreen();
          break;
        default:
          // Handle any other keys if needed
          break;
      }
    },
    [isFocused, liveCategories.length, handleCategoryClick, fullScreen, focusedIndex]
  );

  useEffect(() => {
    // Add key event listener
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown]);

  return (
    <>
      <ListDivision isFocused={isFocused === 0} />
      <div className="live-categories-container">
        <div className="live-categories-list">
          <ul className="live-categories">
            {liveCategories?.map((category, index) => (
              <li
                key={index}
                ref={(el) => (itemRefs.current[index] = el)}
                onClick={() => handleCategoryClick(index)}
                className={`category-item ${
                  focusedIndex === index && isFocused === 1 ? "focused" : ""
                } ${selectedCategory === index ? "selected" : ""}`}
                tabIndex={focusedIndex === index ? 0 : -1}
                onFocus={() => setFocusedIndex(index)}
                title={category.category_name}
                role="option"
                aria-selected={selectedCategory === index}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleCategoryClick(index);
                  }
                }}
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
            fullScreen={fullScreen}
          />
        )}

        {err ? (
          <div className={`${isFocused === 3 ? "selected" : ""} iptv-player`}>
            <p> {err}</p>
          </div>
        ) : (
          <div
            className={`${isFocused === 3 ? "selected" : ""} iptv-player`}
            onClick={fullScreen}
            tabIndex="0"
            aria-label="IPTV Player"
          >
            {videoLoading && (
              <div className="video-loading-overlay">
                <span className="video-loading-spinner" />
                <span>Loading video...</span>
              </div>
            )}
            <ReactPlayer
              url={url}
              playing
              width={"100%"}
              height={"100%"}
              onBufferEnd={() => {
                setLoading(false);
                setErr(null);
                setVideoLoading(false);
              }}
              onReady={() => {
                setErr(null);
                setLoading(true);
                setVideoLoading(false);
              }}
              onBuffer={() => setVideoLoading(true)}
              onEnded={() => setVideoLoading(false)}
              onPause={() => setVideoLoading(false)}
              onError={(error) => {
                setErr(`Error loading video: ${error}`);
                setLoading(false);
                setVideoLoading(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  fullScreen();
                }
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default LiveCategoriesList;
