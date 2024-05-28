import React, { useContext } from "react";
import { Context } from "../../Util/createContext";
import Logo from "../../assets/logo.png";
import star from "../../assets/star.png";
import fillStar from "../../assets/fillStar.png";
import "../../Style/MoviesList.scss";

export default function Movie({ moviesList, favoriteList }) {
  const { serverUrl, username, password, setUrlPlayer, setError } =
    useContext(Context);

  const handleMovieClick = async (movieId) => {
    setError(null);
    try {
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

  const inFavorite = (stream) => {
    const isIn = favoriteList.some(
      (item) => item.stream_id === stream.stream_id
    );
    if (isIn) {
      return true;
    } else {
      return false;
    }
  };

  const handelFavorite = async (stream) => {
    let streamIndex = favoriteList.findIndex(
      (item) => item.stream_id === stream.stream_id
    );

    if (streamIndex === -1) {
      favoriteList.push(stream);
    } else {
      favoriteList.splice(streamIndex, 1);
    }
    localStorage.setItem("favoriteListMovie", JSON.stringify(favoriteList));
  };

  return (
    <div>
      <ul className="movies-list">
        {moviesList.map((movie) => (
          <li
            className="movie"
            key={movie.stream_id}
            onClick={() => handleMovieClick(movie.stream_id)}
          >
            <span className="movie-icon">
              <img
                src={movie.stream_icon ? `${movie.stream_icon}` : { Logo }}
                width="20"
                height="20"
                alt=""
              />
            </span>
            <span className="movie-name">{movie.name}</span>
            <span
              onClick={() => handelFavorite(movie)}
              className="favorite_icon"
            >
              <img
                src={inFavorite(movie) ? fillStar : star}
                alt=""
                width={"20px"}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
