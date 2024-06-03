import React, { useEffect, useState, useContext } from "react";
import { Context } from "../../Util/createContext";
import "../../Style/SeriesData.scss";

export default function SeriesEpisodes({ episodes }) {
  const [episodesdata, setepisodesdata] = useState([]);
  const { setError, serverUrl, username, password, setUrlPlayer } =
    useContext(Context);

  useEffect(() => {
    setepisodesdata(Object.values(episodes));
  }, [episodes]);

  const handleSeriesClick = (seriesId, idx) => {
    setError("");
    const streamUrl = `${serverUrl}/series/${username}/${password}/${seriesId}.${episodesdata[idx].container_extension}`;
    setUrlPlayer(streamUrl);
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
            <p>
              <h2>Episode</h2>
              {episode.episode_num}
            </p>
            <p>
              <h2>Title</h2>
              {episode.title}
            </p>
            <p>
              <h2>Duration</h2>
              {episode?.info?.duration}
            </p>
            <p>
              <h2>Season</h2>
              {episode.season}
            </p>
            <p>
              <h2>Added</h2>
              {new Date(episode.added * 1000).toDateString()}
            </p>
          </div>
        );
      })}
    </div>
  );
}
