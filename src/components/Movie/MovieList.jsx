import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../Util/createContext";
import Logo from "../../assets/logo.png";

import "../../Style/MoviesList.scss";

export default function Movie({ moviesList }) {
  const { setError } = useContext(Context);
  const navigate = useNavigate();

  const handleMovieClick = async (movieId) => {
    setError(null);
    navigate(`/movies/${movieId}`);
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
          </li>
        ))}
      </ul>
    </div>
  );
}
