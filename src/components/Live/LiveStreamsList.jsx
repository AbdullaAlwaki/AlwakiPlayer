import React, { useState, useEffect, useContext, useCallback } from "react";
import { Context } from "../../Util/createContext";
import { inFavorite, handelFavorite } from "../../Util/helperfunction";
import Logo from "../../assets/logo.png";
import star from "../../assets/star.png";
import fillStar from "../../assets/fillStar.png";

const LiveStreamsList = ({ categoryId, favoriteList, setUrel, isFocused }) => {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const [liveStreams, setLiveStreams] = useState([]);
  const { serverUrl, username, password, setError, setLoading } =
    useContext(Context);
  
    const handleStreamClick = useCallback((stream) => {
    setLoading(true);
    setError(null);
    setUrel(null);
    const streamUrl = `${serverUrl}/live/${username}/${password}/${
      stream.stream_id
    }.${!stream.ext || stream.ext === "" ? "m3u8" : stream.ext}`;
    setUrel(streamUrl);
  }, [username, password, serverUrl, setError, setLoading, setUrel])

  useEffect(() => {
    if (categoryId === 1) {
      setLiveStreams(favoriteList);
      return;
    }

    const fetchData = async () => {
      const url = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams&category_id=${categoryId}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        setLiveStreams(data);
      } catch (error) {
        console.error("Error fetching live streams:", error);
      }
    };
    fetchData();

    const handleKeyDown = (event) => {
      if (isFocused === 2)
        switch (event.key) {
          case "ArrowDown":
            setFocusedIndex((prevIndex) =>
              Math.min(prevIndex + 1, liveStreams.length)
            );
            break;
          case "ArrowUp":
            setFocusedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
            break;
          case "Enter":
            handleStreamClick();
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
    categoryId,
    serverUrl,
    username,
    password,
    favoriteList,
    isFocused,
    liveStreams.length,
  ]);

  return (
    <div className="live-stream-item">
      <ul className="live-streams">
        {liveStreams.map((stream, i) => (
          <li
            key={stream.stream_id}
            onClick={() => handleStreamClick(stream)}
            className={`stream-item ${focusedIndex === i ? "focused" : ""}`}
          >
            <span>
              <img
                src={stream.stream_icon ? `${stream.stream_icon}` : { Logo }}
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
                width={"20px"}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LiveStreamsList;
