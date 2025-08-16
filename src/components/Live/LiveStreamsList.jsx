import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { Context } from "../../Util/createContext";
import { inFavorite, handelFavorite } from "../../Util/helperfunction";
import Logo from "../../assets/logo.png";
import star from "../../assets/star.png";
import fillStar from "../../assets/fillStar.png";

const LiveStreamsList = ({ categoryId, favoriteList = [], setUrel, isFocused, fullScreen, setCategories }) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [selectedStream, setSelectedStream] = useState(null);
  const [liveStreams, setLiveStreams] = useState([]);
  const itemRefs = useRef([]);

  const { serverUrl, username, password, setError, setLoading } = useContext(Context);

  // Memoized function to handle stream click
  const handleStreamClick = useCallback(
    (stream) => {
      // Check if the clicked stream is the same as the selected stream
      if (selectedStream === stream.num) {
        fullScreen()
        return;
      }
      setLoading(true);
      setError(null);
      setUrel(null);
      // Also clear any video error in parent
      if (typeof window.setLiveCategoriesListErr === 'function') {
        window.setLiveCategoriesListErr(null);
      }
      setUrel({stream_id: stream.stream_id,
        name: stream.name,
        stream_icon: stream.stream_icon || Logo,
        ext : stream.ext || "m3u8",});
      setSelectedStream(stream.num);
    },
    [username, password, serverUrl, setError, setLoading, setUrel, selectedStream, fullScreen]
  );

  const fetchData = useCallback(async () => {
    if (categoryId === 1) {
      setLiveStreams(favoriteList);
      return;
    }

    const url = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams&category_id=${categoryId}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      setLiveStreams(data);
      setCategories(data);
    } catch (error) {
      setError("Error fetching live streams:", error);
    }
  }, [categoryId, serverUrl, username, password, setError, favoriteList]);

  useEffect(() => {
    fetchData(); 
  }, [fetchData]);

  const handleKeyDown = useCallback((event) => {
    if (isFocused !== 2) return;

    // Prevent default behavior for navigation keys
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
    }

    switch (event.key) {
      case "ArrowDown":
        setFocusedIndex((prevIndex) => {
          const newIndex = Math.min(prevIndex + 1, liveStreams.length - 1);
          // Smooth scroll into view
          itemRefs.current[newIndex]?.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
          return newIndex;
        });
        break;
      case "ArrowUp":
        setFocusedIndex((prevIndex) => {
          const newIndex = Math.max(prevIndex - 1, 0);
          // Smooth scroll into view
          itemRefs.current[newIndex]?.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
          return newIndex;
        });
        break;
      case "Enter":
        if (liveStreams[focusedIndex]) {
          handleStreamClick(liveStreams[focusedIndex]);
        }
        break;
      default:
        break;
    }
  }, [isFocused, focusedIndex, liveStreams, handleStreamClick]);

  useEffect(() => {
    // Use capture phase to handle events before they bubble
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [handleKeyDown]);

  return (
    <div className="live-stream-item" role="region" aria-label="Live Streams List">
      <ul className="live-streams" role="listbox" 
        tabIndex={0}
        aria-activedescendant={`stream-${focusedIndex}`}>
        {liveStreams.map((stream, i) => (
          <li
            ref={el => (itemRefs.current[i] = el)}
            key={stream.stream_id}
            onClick={() => handleStreamClick(stream)}
            className={`stream-item ${focusedIndex === i && isFocused === 2 ? "focused" : ""} ${
              selectedStream === stream.num ? "selected" : ""
            }`}
            role="option"
            aria-selected={selectedStream === stream.num}
            id={`stream-${i}`}
            tabIndex={focusedIndex === i && isFocused === 2 ? 0 : -1}
            
          >
            <span aria-hidden="true">
              {stream.num}
            </span>

            <span>
              <img
                src={stream.stream_icon || Logo}
                width="100"
                height="100"
                alt="Stream Icon"
                aria-hidden="true"
                lazyload="lazy"
              />
              {stream.name}
            </span>
            <span 
              onClick={(e) => {
                e.stopPropagation();
                handelFavorite(stream, "Live", favoriteList);
              }}
              role="button"
              aria-label={`${inFavorite(stream, favoriteList) ? 'Remove from' : 'Add to'} favorites`}
            >
              <img
                src={inFavorite(stream, favoriteList) ? fillStar : star}
                alt=""
                width="20px"
                aria-hidden="true"
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LiveStreamsList;
