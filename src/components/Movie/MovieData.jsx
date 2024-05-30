import React, { useEffect, useContext, useState } from "react";
import Player from "../../Util/Player";
import { useParams } from "react-router-dom";
import { Context } from "../../Util/createContext";
import logo from "../../assets/Untitled-1.png";
import "../../Style/MovieData.scss";

export default function MovieData() {
  const { serverUrl, username, password, setUrlPlayer, setError } =
    useContext(Context);
  const [movieData, setMovieData] = useState([]);
  const [index, setIndex] = useState(0);
  const [close, setClose] = useState(false);
  const [translatedText, setTranslatedText] = useState("");

  const id = useParams();

  const backdropImg = (movieData?.info?.backdrop || "")
    .split("\r\n")
    .slice(0, -1);
  if (backdropImg.length === 0) {
    backdropImg.push(logo);
  }

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_info&vod_id=${id.id}`
      );
      const data = await response.json();
      setMovieData(data);
    };
    fetchData();

    const interval = setInterval(() => {
      setIndex((previndex) => (previndex + 1) % backdropImg.length);
    }, 5000);
    setUrlPlayer(
      `https://www.youtube.com/embed/${movieData?.info?.youtube_trailer}`
    );

/*     const translateToArabicUseAPI = () => {
      fetch(
        `https://api.mymemory.translated.net/get?q=${movieData?.info?.plot}&langpair=en|ar`
      )
        .then((res) => res.json())
        .then((data) => {
          setTranslatedText(data.responseData.translatedText);
        })
        .catch((err) => console.log(err));
    };
    translateToArabicUseAPI(); */

    return () => clearInterval(interval);
  }, [id.id, backdropImg.length, serverUrl, username, password]);

  const handleMovieClick = async (movieId) => {
    setError("");
    try {
      setClose(true);
      const response = await fetch(
        `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_info&vod_id=${movieId}`
      );
      const data = await response.json();
      const streamUrl =
        data.movie_data.direct_source ||
        `${serverUrl}/movie/${username}/${password}/${movieId}.${data.movie_data.container_extension}`;
      setUrlPlayer(streamUrl);
    } catch (error) {
      setError("Error fetching movie details:", error);
    }
  };

  const handleTrailerClick = () => {
    setError("");
    setClose(true);
    setUrlPlayer(
      `https://www.youtube.com/embed/${movieData?.info?.youtube_trailer}`
    );
  };

  const clickOutside = (e) => {
    if (e.target.classList.contains("movieData_Player")) {
      setClose(false);
    }
  };
  return (
    <div className="movieData">
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

      <div className="movieData_info">
        <div className="movieData_info_text">
          <p className="movieData_info_text_title">
            {movieData?.movie_data?.name}
          </p>
          <div className="movieData_info_text_info">
            <p className="movieData_info_text_genre">
              {movieData?.info?.genre}
            </p>
            <p className="movieData_info_text_rating">
              {movieData?.info?.rating}
              <span>&#9733;</span>
            </p>
            <p>{movieData?.info?.duration}</p>
          </div>

          <p className="movieData_info_text_description">
            {movieData?.info?.plot}
          </p>
          <div className="movieData_info_text_buttons">
            <button onClick={() => handleMovieClick(id.id)}>play</button>
            <button onClick={handleTrailerClick}>Trailer</button>
          </div>
        </div>
        
        <div className="movieData_info_details">
          <p className="movieData_info_details_release">
            <span>Release Date</span>
            {movieData?.info?.releasedate}
          </p>
          <p className="movieData_info_details_cast">
            <span>The Actors</span>
            {movieData?.info?.cast}
          </p>
          <p className="movieData_info_details_director">
            <span>Director</span>
            {movieData?.info?.director}
          </p>
        </div>
      </div>

      <div className="movieData_image">
        <img src={movieData?.info?.movie_image} alt="" />
      </div>
      {close ? (
        <div className="movieData_Player" onClick={clickOutside}>
          <div className="movieData_Player_overlay">
            <Player />
          </div>
        </div>
      ) : null}
    </div>
  );
}
