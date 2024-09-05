import React, { useState, useEffect, useContext, useCallback } from "react";
import { Context } from "../../Util/createContext";
import { inFavorite, handelFavorite } from "../../Util/helperfunction";
import Logo from "../../assets/logo.png";
import star from "../../assets/star.png";
import fillStar from "../../assets/fillStar.png";

const LiveStreamsList = ({ categoryId, favoriteList = [], setUrel, isFocused, fullScreen }) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [selectedStream, setSelectedStream] = useState(null);
  const [liveStreams, setLiveStreams] = useState([]);

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
      const streamUrl = `${serverUrl}/live/${username}/${password}/${stream.stream_id}.${!stream.ext || stream.ext === "" ? "m3u8" : stream.ext}`;

      setUrel(streamUrl);
      setSelectedStream(stream.num);
    },
    [username, password, serverUrl, setError, setLoading, setUrel, selectedStream]
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
    } catch (error) {
      setError("Error fetching live streams:", error);
    }
  }, [categoryId, serverUrl, username, password, setError, favoriteList]);

  useEffect(() => {
    fetchData(); 
  }, [fetchData]);

  const handleKeyDown = useCallback((event) => {
    if (isFocused !== 2) return;

    switch (event.key) {
      case "ArrowDown":
        setFocusedIndex((prevIndex) => Math.min(prevIndex + 1, liveStreams.length - 1));
        break;
      case "ArrowUp":
        setFocusedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
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
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="live-stream-item">
      <ul className="live-streams">
        {liveStreams.map((stream, i) => (
          <li
            key={stream.stream_id}
            onClick={() => handleStreamClick(stream)}
            className={`stream-item ${focusedIndex === i && isFocused === 2 ? "focused" : ""} ${
              selectedStream === stream.num ? "selected" : ""
            }`}
          >
            <span>
              {stream.num}
            </span>

            <span>
              <img
                src={stream.stream_icon || Logo}
                width="20"
                height="20"
                alt=""
              />
              {stream.name}
            </span>
            <span onClick={() => handelFavorite(stream, "Live", favoriteList)}>
              <img
                src={inFavorite(stream, favoriteList) ? fillStar : star}
                alt=""
                width="20px"
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LiveStreamsList;
