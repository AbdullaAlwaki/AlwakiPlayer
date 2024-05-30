import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../Util/createContext";
import Logo from "../../assets/logo.png";
import star from "../../assets/star.png";
import fillStar from "../../assets/fillStar.png";
import "../../Style/SeriesList.scss";

export default function ({ seriesList }) {
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [episodesList, setEpisodesList] = useState([]);
  const { serverUrl, setUrlPlayer, username, password, setError } =
    useContext(Context);
  const navigate = useNavigate();

  const favoriteList = JSON.parse(localStorage.getItem("favoriteListSeries")) || [];

  const handleEpisodeClick = (episode) => {
    const streamUrl =
      episode.direct_source ||
      `${serverUrl}/series/${username}/${password}/${episode.id}.${episode.container_extension}`;
    setUrlPlayer(streamUrl);
  };

  const handleSeriesClick = async (seriesId) => {
    setError(null);
    navigate(`/series/${seriesId}`);
    /* setSelectedSeries(seriesId);
    const url = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_series_info&series_id=${seriesId}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      setEpisodesList(data.episodes);
      setSelectedSeries(seriesId);
    } catch (error) {
      console.error("Error fetching series episodes:", error);
    } */
  };

  const inFavorite = (series) => {
    const isIn = favoriteList.some(
      (item) => item.series_id === series.series_id
    );
    if (isIn) {
      return true;
    } else {
      return false;
    }
  };

    const handelFavorite = async (series) => {
    let seriesIndex = favoriteList.findIndex(
      (item) => item.series_id === series.series_id
    );

    if (seriesIndex === -1) {
        favoriteList.push(series);
        }
    else {
        favoriteList.splice(seriesIndex, 1);
        }
    localStorage.setItem("favoriteListSeries", JSON.stringify(favoriteList));
    }


  return (
    <div>
      <ul className="series_list">
        {seriesList.map((series) => (
          <li
            className="series"
            key={series.series_id}
            onClick={() => handleSeriesClick(series.series_id)}
          >
            <span className="series-icon">
              <img src={series.cover ? `${series.cover}` : { Logo }} alt="" />
            </span>
            <span className="series_name">{series.name}</span>

            <span
              onClick={() => handelFavorite(series)}
              className="favorite_icon"
            >
              <img
                src={inFavorite(series) ? fillStar : star}
                alt=""
                width={"30px"}
              />
            </span>
            {/* {selectedSeries === series.series_id && (
              <ul>
                {Object.keys(episodesList).map((season) => (
                  <li key={season}>
                    <h4>{season}</h4>
                    <ul>
                      {episodesList[season].map((episode) => (
                        <li key={episode.id}>
                          <div onClick={() => handleEpisodeClick(episode)}>
                            {episode.title}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )} */}
          </li>
        ))}
      </ul>
    </div>
  );
}
