import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../Util/createContext";
import { inFavorite, handelFavorite } from "../../Util/helperfunction";
import Logo from "../../assets/logo.png";
import star from "../../assets/star.png";
import fillStar from "../../assets/fillStar.png";

const LiveStreamsList = ({ categoryId, favoriteList, setUrel }) => {
  const [liveStreams, setLiveStreams] = useState([]);
  const { serverUrl, username, password, setError, setLoading } =
    useContext(Context);

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
  }, [categoryId, serverUrl, username, password, favoriteList]);

  const handleStreamClick = (streamId) => {
    setLoading(true);
    setError(null);
    setUrel(null);
    const streamUrl = `${serverUrl}/live/${username}/${password}/${streamId}.m3u8`;
    setUrel(streamUrl);
  };

  return (
    <div className="live-stream-item">
      <ul className="live-streams">
        {liveStreams.map((stream) => (
          <li
            key={stream.stream_id}
            onClick={() => handleStreamClick(stream.stream_id)}
            className="stream-item"
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
            <span
              onClick={() => handelFavorite(stream, "Live", favoriteList)}
            >
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
