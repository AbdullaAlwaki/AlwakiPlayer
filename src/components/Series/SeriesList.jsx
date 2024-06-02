import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../Util/createContext";
import Logo from "../../assets/logo.png";

import "../../Style/SeriesList.scss";

export default function Series({ seriesList }) {
  const { setError } = useContext(Context);
  const navigate = useNavigate();
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
          </li>
        ))}
      </ul>
    </div>
  );
}
