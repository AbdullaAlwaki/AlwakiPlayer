import React, { useEffect, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { Context } from "../../Util/createContext";
import Player from "../../Util/Player";
import SeriesEpisodes from "./SeriesEpisodes";
import logo from "../../assets/logo.png";
import star from "../../assets/star.png";
import fillStar from "../../assets/fillStar.png";
import "../../Style/SeriesData.scss";

export default function SeriesData() {
  const [seriesData, setSeriesData] = useState({});
  const [index, setIndex] = useState(0);
  const [close, setClose] = useState(false);
  const [favoriteList, setFavoriteList] = useState(
    JSON.parse(localStorage.getItem("favoriteListSeries")) || []
  );
  const { serverUrl, username, password, setUrlPlayer, setError } =
    useContext(Context);
  const id = useParams();
  const backdropImg = (seriesData?.info?.backdrop || "")
    .split("\r\n")
    .slice(0, -1);
  if (backdropImg.length === 0) {
    backdropImg.push(logo);
  }
console.log(seriesData);
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_series_info&series_id=${id.id}`
      );
      const data = await response.json();
      data?.seasons?.push({
        cover: data.info.cover,
        name: `Season ${data.seasons.length + 1}`,
        episode_count: Object.keys(data.episodes).length,
      });
      setSeriesData(data);
    };
    fetchData();

    const interval = setInterval(() => {
      setIndex(
        (prevIndex) => (prevIndex + 1) % seriesData?.info?.backdrop_path?.length
      );
    }, 5000);

    setUrlPlayer(
      `https://www.youtube.com/embed/${seriesData?.info?.youtube_trailer}`
    );

    return () => clearInterval(interval);
  }, [
    id,
    serverUrl,
    username,
    password,
    setUrlPlayer,
    seriesData?.info?.youtube_trailer,
  ]);

  const handelSeriesClick = async (seriesId) => {
    setError("");
    try {
      setClose(true);
      const response = await fetch(
        `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_series_info&series_id=${seriesId}`
      );
      const data = await response.json();
      console.log(data);
      const streamUrl =
        data.series_data.direct_source ||
        `${serverUrl}/movie/${username}/${password}/${seriesId}.${data.movie_data.container_extension}`;
      setUrlPlayer(streamUrl);
    } catch (error) {
      setError("Error fetching movie details:", error);
    }
  };

  const handleTrailerClick = () => {
    setError("");
    setClose(true);
    setUrlPlayer(
      `https://www.youtube.com/embed/${seriesData?.info?.youtube_trailer}`
    );
  };

  const clickOutside = (e) => {
    if (e.target.classList.contains("seriesData_Player")) {
      setClose(false);
    }
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
    console.log(e);
    setSeriesData({
      ...seriesData,
      info: {
        ...seriesData.info,
        name: e.name,
        cover: e.cover,
      },
    });
  };

  const seasons_count = Object.values(seriesData?.episodes)  || [];


  console.log(seriesData);

  return (
    <div className="seriesData">
      <div className="carusel_container">
        <div
          className="carusel"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {backdropImg.map((img, index) => (
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
            <p>{seasons_count?.length || 1}</p>
          </div>
          <p className="seriesData_info_text_description">
            {seriesData?.info?.plot}
          </p>
          <div className="seriesData_info_text_buttons">
            <button onClick={() => handelSeriesClick(id.id)}>play</button>

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
            <span className="seasons_name">{season.name}</span>
            <p>{seriesData?.episodes[index]?.length}</p>
          </div>
        ))}
      </div>

      <SeriesEpisodes episodes={seasons_count[0] || ""} />

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

        <div>
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
        <div className="seriesData_Player" onClick={clickOutside}>
          <div className="seriesData_Player_overlay">
            <Player />
          </div>
        </div>
      ) : null}
    </div>
  );
}
