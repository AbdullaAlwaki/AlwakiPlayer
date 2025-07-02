import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { Context } from "../../Util/createContext";
import { fetchData } from "../../Util/helperfunction";
import LiveStreamsList from "./LiveStreamsList";
import ListDivision from "../ListDivision";
import "./live-categories-list.scss";
import Hls from 'hls.js';

const LiveCategoriesList = () => {
  const [liveCategories, setLiveCategories] = useState([]);
  const [err, setErr] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [url, setUrel] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(1);
  const [videoLoading, setVideoLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const itemRefs = useRef([]);
  const loadingTimeout = useRef(null);
  const playerContainerRef = useRef(null); // Add ref for the player container
  const videoRef = useRef(null); // Ref for the video element
  const hlsInstance = useRef(null); // HLS.js instance
  const { serverUrl, username, password, setError, setLoading } =
    useContext(Context);

  const maxRetries = 3;
  const retryDelay = 2000; // ms

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
    return () => { delete window.setLiveCategoriesListErr; };
  }, [setErr]);

  const handleCategoryClick = useCallback((categoryId) => {
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
  }, [selectedCategory]);

  const fullScreen = useCallback(() => {
    const elem = playerContainerRef.current; // Use the player container ref
    if (elem) {
      if (!document.fullscreenElement) {
        elem.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
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
    [isFocused, liveCategories.length, handleCategoryClick, fullScreen, focusedIndex]
  );

  useEffect(() => {
    // Add key event listener
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown]);

  const handlePlayerError = useCallback((error) => {
    if (retryCount < maxRetries) {
      setTimeout(() => {
        setRetryCount((c) => c + 1);
        setErr(null);
        setUrel(null);
        setTimeout(() => setUrel(url), 100); // force reload
      }, retryDelay);
    } else {
      setErr('Error loading video. Please try again later.');
      setLoading(false);
      setVideoLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount, url, setLoading]);

  useEffect(() => {
    if (videoLoading) {
      loadingTimeout.current = setTimeout(() => {
        setVideoLoading(true);
      }, 1000); // show spinner if loading > 1s
    } else {
      clearTimeout(loadingTimeout.current);
    }
    return () => clearTimeout(loadingTimeout.current);
  }, [videoLoading]);

  // HLS.js integration for .m3u8 streams
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (url.endsWith('.m3u8') && !isIOS) {
      if (Hls.isSupported()) {
        if (hlsInstance.current) {
          hlsInstance.current.destroy();
        }
        const hls = new Hls();
        hls.attachMedia(video);
        hls.loadSource(url);
        hlsInstance.current = hls;
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            handlePlayerError(data);
          }
        });
      } else {
        // Fallback: set src directly
        video.src = url;
      }
    } else {
      // For non-HLS or iOS, set src directly
      video.src = url;
    }
    return () => {
      if (hlsInstance.current) {
        hlsInstance.current.destroy();
        hlsInstance.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, handlePlayerError]);

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
          <div
            className={`modern-error-overlay ${isFocused === 3 ? "selected" : ""} iptv-player`}
            style={{
              width: '100%',
              maxWidth: 800,
              margin: '0 auto',
              background: '#000',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              height: videoRef.current && videoRef.current.videoHeight
                ? `${videoRef.current.clientHeight}px`
                : 'auto',
              minHeight: 200
            }}
          >
            <div style={{ width: '100%', textAlign: 'center' }}>
              <p>{err}</p>
              {retryCount < maxRetries && (
                <button className="retry-btn" onClick={() => {
                  setRetryCount(0);
                  setErr(null);
                  setUrel(null);
                  setTimeout(() => setUrel(url), 100);
                }}>Retry</button>
              )}
            </div>
          </div>
        ) : (
          <div
            className={`modern-player ${isFocused === 3 ? "selected" : ""} iptv-player`}
            onClick={fullScreen}
            tabIndex="0"
            aria-label="IPTV Player"
            ref={playerContainerRef}
            style={{
              width: '100%',
              maxWidth: 800,
              margin: '0 auto',
              background: '#000',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              height: videoRef.current && videoRef.current.videoHeight
                ? `${videoRef.current.clientHeight}px`
                : 'auto',
              minHeight: 200
            }}
          >
            {videoLoading && (
              <div className="modern-video-loading-overlay">
                <span className="modern-video-loading-spinner" />
                <span>Loading video...</span>
              </div>
            )}
            <video
              ref={videoRef}
              controls
              autoPlay
              width="100%"
              style={{ width: '100%', height: 'auto', maxHeight: '80vh', background: '#000' }}
              onLoadedData={() => {
                setErr(null);
                setLoading(true);
                setVideoLoading(false);
                setRetryCount(0);
                // Force update to sync container height
                if (playerContainerRef.current) playerContainerRef.current.style.height = videoRef.current ? `${videoRef.current.clientHeight}px` : 'auto';
              }}
              onWaiting={() => setVideoLoading(true)}
              onPlaying={() => setVideoLoading(false)}
              onPause={() => setVideoLoading(false)}
              onEnded={() => setVideoLoading(false)}
              onError={handlePlayerError}
              onClick={e => e.stopPropagation()}
              tabIndex={0}
              onKeyDown={event => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  fullScreen();
                }
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>
    </>
  );
};

export default LiveCategoriesList;
