import React, { useEffect, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { Context } from "../../Util/createContext";
import Player from "../../Util/Player";
import Logo from "../../assets/logo.png";
import "../../Style/SeriesData.scss";

export default function SeriesData() {
  const [seriesData, setSeriesData] = useState([]);
  const [index, setIndex] = useState(0);
  const [close, setClose] = useState(false);
  const { serverUrl, username, password, setUrlPlayer, setError } =
    useContext(Context);

  const id = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_series_info&series_id=${id.id}`
        );
        const data = await response.json();
        data.seasons.push({
          cover: data.info.cover,
          name: `Season ${data.seasons.length + 1}`,
          episode_count: Object.keys(data.episodes).length,
        });
        setSeriesData(data);
      } catch (error) {
        console.error("Error fetching series episodes:", error);
      }
    };
    fetchData();
    const interval = setInterval(() => {
      setIndex(
        (previndex) => (previndex + 1) % seriesData?.info?.backdrop_path.length
      );
    }, 5000);
    setUrlPlayer(
      `https://www.youtube.com/embed/${seriesData?.info?.youtube_trailer}`
    );

    return () => clearInterval(interval);
  }, [id.id, serverUrl, username, password]);

  const clickOutside = (e) => {
    if (e.target.classList.contains("seriesData_Player")) {
      setClose(false);
    }
  };

  const handleTrailerClick = () => {
    if (seriesData?.info?.youtube_trailer === "") {
      setError("No trailer available");
      return;
    }
    setError("");
    setClose(true);
    setUrlPlayer(
      `https://www.youtube.com/embed/${seriesData?.info?.youtube_trailer}`
    );
  };


  // console.log(Object.keys(seriesData.episodes))
  return (
    <div className="seriesData">
      <div className="carusel_container">
        <div
          className="carusel"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {seriesData?.info?.backdrop_path.map((img, index) => (
            <div
              key={index}
              className="carusel_item"
              style={{ backgroundImage: `url(${img})` }}
            ></div>
          ))}
        </div>
      </div>

      <div className="seriesData_info">
        <div className="seriesData_info_text">
          <p className="seriesData_info_text_title">{seriesData?.info?.name}</p>
          <div className="seriesData_info_text_info">
            <p className="seriesData_info_text_genre">
              {seriesData?.info?.genre}
            </p>
            <p className="seriesData_info_text_rating">
              {seriesData?.info?.rating}
              <span>&#9733;</span>
            </p>
            <p>
              {seriesData?.seasons?.length
                ? Object.keys(seriesData.episodes).length
                : "1"}
            </p>
          </div>
          <p className="seriesData_info_text_description">
            {seriesData?.info?.plot}
          </p>
          <div className="seriesData_info_text_buttons">
            <button>play</button>
            <button onClick={handleTrailerClick}>
              {seriesData?.info?.youtube_trailer === ""
                ? "No trailer available"
                : "Trailer"}
            </button>
          </div>
        </div>

        <div className="seriesData_image">
          <img src={seriesData?.info?.cover} alt="cover" />
        </div>
      </div>

      <div className="seriesData_seasons">
        {seriesData?.seasons?.map((season, index) => (
          <div className="seasons" key={index}>
            <span className="seasons_icon">
              <img src={season.cover ? `${season.cover}` : { Logo }} alt="" />
            </span>
            <span className="seasons_name">{season.name}</span>
         {/*    <p>{seriesData?.episodes[index].length}</p> */}
          </div>
        ))}
      </div>

      <div>
        <div className="seriesData_info_details">
          <p className="seriesData_info_details_release">
            <span>Release Date</span>
            {seriesData?.info?.releaseDate}
          </p>
          <p className="seriesData_info_details_cast">
            <span>The Actors</span>
            {seriesData?.info?.cast}
          </p>
          <p>
            <span>lastModifaied</span>
            {new Date(seriesData?.info?.last_modified * 1000).toDateString()}
          </p>
          <p className="seriesData_info_details_director">
            <span>Director</span>
            {seriesData?.info?.director}
          </p>
        </div>
      </div>

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
