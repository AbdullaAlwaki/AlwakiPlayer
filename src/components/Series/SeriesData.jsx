import React, { useEffect, useContext, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Context } from "../../Util/createContext";
import Player from "../../Util/Player";
import SeriesEpisodes from "./SeriesEpisodes";
import Carusel from "../../Util/Carusel";
import logo from "../../assets/logo.png";
import star from "../../assets/star.png";
import fillStar from "../../assets/fillStar.png";
import "../../Style/SeriesData.scss";

export default function SeriesData() {
  const [seriesData, setSeriesData] = useState({});
  const [index, setIndex] = useState(0);
  const [seasonNum, setSeasonNum] = useState(1);
  const [close, setClose] = useState(false);
  const [favoriteList, setFavoriteList] = useState(
    JSON.parse(localStorage.getItem("favoriteListSeries")) || []
  );
  const { serverUrl, username, password, setUrlPlayer, setError } =
    useContext(Context);
  const seriesDataListRef = useRef();
  const id = useParams();

  const backdropImg = seriesData?.info?.backdrop_path || [];
  if (backdropImg.length === 0) {
    backdropImg.push(logo);
  }
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_series_info&series_id=${id.id}`
      );
      const data = await response.json();
      let episodes = Object.keys(data.episodes || []).length;
      if (!data.seasons) {
        data.seasons = [];
      }
      let seasons = Object.keys(data.seasons || []).length + 1;
      if (!episodes !== seasons) {
        for (let i = seasons; i <= episodes; i++) {
          data?.seasons?.push({
            air_date: data.info.releaseDate,
            cover: data.info.cover,
            cover_big: data.info.cover_big,
            episode_count: data.info.episode_count,
            id: data.info.id,
            name: `Seasson ${i}`,
            overview: data.info.plot,
            season_number: i,
          });
        }
      }

      setSeriesData(data);
    };
    fetchData();

    const interval = setInterval(() => {
      setIndex(
        (prevIndex) => (prevIndex + 1) % seriesData?.info?.backdrop_path?.length
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [id, serverUrl, username, password, setUrlPlayer]);

  const handelSeriesClick = () => {
    setError("");
    setClose(true);
  };

  const handleTrailerClick = () => {
    setError("");
    setUrlPlayer(
      `https://www.youtube.com/embed/${seriesData?.info?.youtube_trailer}`
    );
  };
  const inFavorite = () => {
    return favoriteList.some((item) => item === id.id);
  };

  const handleFavorite = () => {
    const isIn = favoriteList.some((item) => item === id.id);

    let updatedFavoriteList;
    if (!isIn) {
      updatedFavoriteList = [...favoriteList, id.id];
    } else {
      updatedFavoriteList = favoriteList.filter((item) => item !== id.id);
    }
    setFavoriteList(updatedFavoriteList);
    localStorage.setItem(
      "favoriteListSeries",
      JSON.stringify(updatedFavoriteList)
    );
  };
  const seasonData = (e) => {
    setSeasonNum(e.season_number);
    setSeriesData({
      ...seriesData,
      info: {
        ...seriesData.info,
        name: e.name,
        cover: e.cover,
        plot: e.overview || seriesData?.info?.plot,
      },
    });
  };

  const seasons_count = Object.values(seriesData?.episodes || []);

  const handleClickOutside = (event) => {
    if (
      seriesDataListRef.current &&
      !seriesDataListRef.current.contains(event.target)
    ) {
      setClose(false);
    }
  };

  useEffect(() => {
    if (close) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [close]);

  const clickOutside = (e) => {
    if (e.target.classList.contains("seriesData_Player")) {
      setClose(false);
    }
  };
  
  const clickOutsideEpisods = (e) => {
    if (e.target.classList.contains("series_episodes_con")) {
      setClose(false);
    }
  };
  return (
    <div className="seriesData">
      <Carusel index={index} backdropImg={backdropImg} />

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
            <p>{seasons_count?.length || 1}</p>
          </div>
          <p className="seriesData_info_text_description">
            {seriesData?.info?.plot}
          </p>
          <div className="seriesData_info_text_buttons">
            <button onClick={() => handelSeriesClick()}>Episodes</button>

            {seriesData?.info?.youtube_trailer === "" ? null : (
              <button onClick={handleTrailerClick}> Trailer </button>
            )}
            <button onClick={handleFavorite} className="favorite_icon">
              <img src={inFavorite() ? fillStar : star} alt="" width={"30px"} />
            </button>
          </div>
        </div>

        <div className="seriesData_image">
          <p>{seriesData?.info?.age}</p>
          <img src={seriesData?.info?.cover} alt="cover" />
        </div>
      </div>

      <div className="seriesData_seasons">
        {seriesData?.seasons?.map((season, index) => (
          <div
            className="seasons"
            key={index}
            onClick={() => seasonData(season)}
          >
            <span className="seasons_icon">
              <img src={season.cover ? season.cover : logo} alt="" />
            </span>

            <p className="seasons_name">
              <span>{season.name}</span>
              {seriesData?.episodes[index + 1]?.length}
            </p>
          </div>
        ))}
      </div>

      <div className="seriesData_info_details">
        <div className="seriesData_info_details_release">
          <h2>Release Date</h2>
          <p>{seriesData?.info?.releaseDate}</p>
        </div>

        <div className="movieData_info_details_add">
          <h2>Added</h2>
          <p>
            {new Date(seriesData?.info?.last_modified * 1000).toDateString()}
          </p>
        </div>

        <div className="seriesData_info_details_cast">
          <h2>The Actors</h2>
          <p>{seriesData?.info?.cast}</p>
        </div>

        <div className="movieData_info_details_last_modified">
          <h2>Last Modified</h2>
          <p>
            {new Date(seriesData?.info?.last_modified * 1000).toDateString()}
          </p>
        </div>

        <div className="seriesData_info_details_director">
          <h2>Director</h2>
          <p>{seriesData?.info?.director}</p>
        </div>
      </div>

      {close ? (
        <div className="series_episodes_con" onClick={clickOutsideEpisods}>
          <SeriesEpisodes episodes={seasons_count[seasonNum - 1] || ""} />
        </div>
      ) : null}

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
