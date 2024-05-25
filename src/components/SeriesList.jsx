import React, { useState, useEffect, useContext } from "react";
import { Context } from "../Util/createContext";
import ReactPlayer from "react-player";
import Logo from "../assets/logo.png";
import "../Style/SeriesList.scss";

const SeriesList = () => {
  const [seriesCategories, setSeriesCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [seriesList, setSeriesList] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [episodesList, setEpisodesList] = useState([]);
  const { serverUrl, urlPlayer, fullScreen, username, password, setUrlPlayer } =
    useContext(Context);

  useEffect(() => {
    const seriesCategories = JSON.parse(
      localStorage.getItem("seriesCategories")
    );
    if (seriesCategories) {
      setSeriesCategories(seriesCategories);
      return;
    }
  }, [serverUrl, username, password]);

  const handleCategoryClick = async (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSeries(null);
    setEpisodesList([]);
    const url = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_series&category_id=${categoryId}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      setSeriesList(data);
    } catch (error) {
      console.error("Error fetching series list:", error);
    }
  };

  const handleSeriesClick = async (seriesId) => {
    setSelectedSeries(seriesId);
    const url = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_series_info&series_id=${seriesId}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      setEpisodesList(data.episodes);
      setSelectedSeries(seriesId);
    } catch (error) {
      console.error("Error fetching series episodes:", error);
    }
  };

  const handleEpisodeClick = (episode) => {
    const streamUrl =
      episode.direct_source ||
      `${serverUrl}/series/${username}/${password}/${episode.id}.${episode.container_extension}`;
    setUrlPlayer(streamUrl);
  };

  return (
    <div>
      <h2>Series Categories</h2>
      <div className="iptv-player" onClick={fullScreen}>
        {urlPlayer ? (
          <ReactPlayer
            url={urlPlayer}
            playing
            width={"100%"}
            height={"100%"}
            controls
            thumbnail="https://alwakistore.onrender.com/static/media/logo.9c361039574df7e0f672.png"
          />
        ) : (
          <img
            src={Logo}
            alt=""
          />
        )}
      </div>
      <ul>
        {seriesCategories.map((category) => (
          <li
            key={category.category_id}
            onClick={() => handleCategoryClick(category.category_id)}
          >
            {category.category_name}
            {selectedCategory === category.category_id && (
              <ul>
                {seriesList.map((series) => (
                  <li
                    key={series.series_id}
                    onClick={() => handleSeriesClick(series.series_id)}
                  >
                    {series.name}
                    {selectedSeries === series.series_id && (
                      <ul>
                        {Object.keys(episodesList).map((season) => (
                          <li key={season}>
                            <h4>{season}</h4>
                            <ul>
                              {episodesList[season].map((episode) => (
                                <li key={episode.id}>
                                  <div
                                    onClick={() => handleEpisodeClick(episode)}
                                  >
                                    {episode.title}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SeriesList;
