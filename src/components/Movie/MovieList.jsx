import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../Util/createContext";
import Logo from "../../assets/logo.png";

import "./MoviesList.scss";

export default function Movie({ moviesList, isFocused }) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { setError } = useContext(Context);
  const navigate = useNavigate();
  const handleMovieClick = async (movieId) => {
    setError(null);
    navigate(`/movies/${movieId}`);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowDown":
          setFocusedIndex((prevIndex) =>
            Math.min(prevIndex + 5, moviesList.length-1)
          );
          break;
        case "ArrowUp":
          setFocusedIndex((prevIndex) => Math.max(prevIndex - 5, 0));
          
          break;
        case "ArrowLeft":
          setFocusedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
          break;
        case "ArrowRight":
          setFocusedIndex((prevIndex) =>
            Math.min(prevIndex + 1, moviesList.length-1)
          );
          break;
        case "Enter":
          handleMovieClick(moviesList[focusedIndex].stream_id);
          break;
        default:
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  });
  return (
    <div>
      <ul className="movies-list">
        {moviesList.map((movie, index) => (
          <li
            className={`movie ${
              focusedIndex === index && isFocused === 2 ? "focused" : ""
            }`}
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
