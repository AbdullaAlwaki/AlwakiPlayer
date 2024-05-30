import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../Util/createContext";
import Logo from "../../assets/logo.png";
import star from "../../assets/star.png";
import fillStar from "../../assets/fillStar.png";
import "../../Style/MoviesList.scss";

export default function Movie({ moviesList, favoriteList }) {
  const { setError } = useContext(Context);
  const navigate = useNavigate();

  const handleMovieClick = async (movieId) => {
    setError(null);
    navigate(`/movies/${movieId}`);
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
                width={"30px"}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
