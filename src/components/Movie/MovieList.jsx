import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../Util/createContext";
import Logo from "../../assets/logo.png";

import "./MoviesList.scss";

export default function Movie({ moviesList, isFocused }) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { setError } = useContext(Context);
  const navigate = useNavigate();

  const [visibleMovies, setVisibleMovies] = useState([]);
  const [loadedItems, setLoadedItems] = useState(0);
  const itemsPerLoad = 20;

  const listRef = useRef(null); // Ref for the movies-list div

  useEffect(() => {
    loadMoreItems(); // Initial load of items
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const div = listRef.current;
      const scrollPosition = div.scrollTop + div.clientHeight;
      const halfwayPoint = div.scrollHeight / 2;

      if (scrollPosition >= halfwayPoint) {
        loadMoreItems();
      }
    };

    const div = listRef.current;
    if (div) {
      div.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (div) {
        div.removeEventListener("scroll", handleScroll);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedItems]);

  const loadMoreItems = () => {
    const moreItems = moviesList.slice(loadedItems, loadedItems + itemsPerLoad);
    setVisibleMovies((prevMovies) => [...prevMovies, ...moreItems]);
    setLoadedItems((prevCount) => prevCount + itemsPerLoad);
  };

  const handleMovieClick = async (movieId) => {
    setError(null);
    navigate(`/movies/${movieId}`);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowDown":
          setFocusedIndex((prevIndex) =>
            Math.min(prevIndex + 5, moviesList.length - 1)
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
            Math.min(prevIndex + 1, moviesList.length - 1)
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
  }, [focusedIndex, moviesList]);

  return (
    <div ref={listRef} className="movies-list">
      <ul >
        {visibleMovies.map((movie, index) => (
          <li
            className={`movie ${
              focusedIndex === index && isFocused === 2 ? "focused" : ""
            }`}
            key={movie.stream_id}
            onClick={() => handleMovieClick(movie.stream_id)}
          >
            <span className="movie-icon">
              <img
                src={movie.stream_icon ? `${movie.stream_icon}` : Logo}
                alt={movie.name}
              />
            </span>
            <span className="movie-name">{movie.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
