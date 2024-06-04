import React, { useEffect, useState, useContext } from "react";
import { Context } from "../../Util/createContext";
import Player from "../../Util/Player";
import "../../Style/SeriesData.scss";

export default function SeriesEpisodes({ episodes }) {
  const [episodesdata, setepisodesdata] = useState([]);
  const [close, setClose] = useState(false);
  const { setError, serverUrl, username, password, setUrlPlayer } =
    useContext(Context);

  useEffect(() => {
    setepisodesdata(Object.values(episodes));
  }, [episodes]);

  const handleSeriesClick = (seriesId, idx) => {
    setClose(true);
    setError("");
    const streamUrl = `${serverUrl}/series/${username}/${password}/${seriesId}.${episodesdata[idx].container_extension}`;
    setUrlPlayer(streamUrl);
  };

  const clickOutside = (e) => {
    if (e.target.classList.contains("seriesData_Player")) {
      setClose(false);
    }
  };

  return (
    <div className="series_episodes">
      {episodesdata.map((episode, idx) => {
        return (
          <div
            key={episode.id}
            className="episodes_data"
            onClick={() => handleSeriesClick(episode.id, idx)}
          >
            <div>
              <h2>Episode</h2>
              {episode.episode_num}
            </div>
            <div>
              <h2>Title</h2>
              {episode.title}
            </div>
            <div>
              <h2>Duration</h2>
              {episode?.info?.duration}
            </div>
            <div>
              <h2>Season</h2>
              {episode.season}
            </div>
            <div>
              <h2>Added</h2>
              {new Date(episode.added * 1000).toDateString()}
            </div>
          </div>
        );
      })}

      {close ? (
        <div className="seriesData_Player" onClick={clickOutside}>
          <div className="seriesData_Player_overlay">
            <Player />
          </div>
        </div>
      ) : null}
    </div>
  );
}
