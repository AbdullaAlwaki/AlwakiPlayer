import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { Context } from "../../Util/createContext";
import { fetchData } from "../../Util/helperfunction";
import LiveStreamsList from "./LiveStreamsList";
import ListDivision from "../ListDivision";
import "./live-categories-list.scss";
import PlayerLive from "./PlayerLive";

const LiveCategoriesList = () => {
  const [liveCategories, setLiveCategories] = useState([]);
  const [err, setErr] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [url, setUrel] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const itemRefs = useRef([]);
  
  const playerContainerRef = useRef(null); // Add ref for the player container
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

  // Expose setErr globally for LiveStreamsList to clear error on channel change
  useEffect(() => {
    window.setLiveCategoriesListErr = setErr;
    return () => {
      delete window.setLiveCategoriesListErr;
    };
  }, [setErr]);

  const handleCategoryClick = useCallback(
    (categoryId) => {
      // If clicking the same category that's already open, close it
      if (selectedCategory === categoryId) {
        setSelectedCategory(null);
        return;
      }
      setSelectedCategory(categoryId);
      // Reset error and retry state when changing channel/category
      setErr(null);
      setRetryCount(0);
      setUrel(null);
    },
    [selectedCategory]
  );

  const fullScreen = useCallback(() => {
    const elem = playerContainerRef.current; // Use the player container ref
    if (elem) {
      if (!document.fullscreenElement) {
        elem.requestFullscreen().catch((err) => {
          console.error(
            `Error attempting to enable full-screen mode: ${err.message}`
          );
        });
      } else {
        document.exitFullscreen();
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      isFocused,
      liveCategories.length,
      handleCategoryClick,
      fullScreen,
      focusedIndex,
    ]
  );

  useEffect(() => {
    // Add key event listener
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown]);



  // HLS.js integration for .m3u8 streams

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
        <PlayerLive
          url={url}
          retryCount={retryCount}
          isFocused={isFocused}
          fullScreen={fullScreen}
          setRetryCount={setRetryCount}
          playerContainerRef={playerContainerRef}
          enableContainerFullscreen={true}
        />
      </div>
    </>
  );
};

export default LiveCategoriesList;
