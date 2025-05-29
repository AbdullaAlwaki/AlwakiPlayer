import { useContext, useEffect, useState, useRef, useCallback } from "react";
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

  const listRef = useRef(null); 

  const handleMovieClick = useCallback(async (movieId) => {
    setError(null);
    navigate(`/movies/${movieId}`);
  }, [navigate, setError]);

  const loadMoreItems = useCallback(() => {
    const moreItems = moviesList.slice(loadedItems, loadedItems + itemsPerLoad);
    setVisibleMovies((prevMovies) => [...prevMovies, ...moreItems]);
    setLoadedItems((prevCount) => prevCount + itemsPerLoad);
  }, [loadedItems, moviesList, itemsPerLoad]);

  useEffect(() => {
    loadMoreItems(); 
  }, [loadMoreItems]);

  useEffect(() => {
    const handleScroll = () => {
      const ul = listRef.current;
      const scrollPosition = ul.scrollTop + ul.clientHeight;
      const halfwayPoint = ul.scrollHeight / 2;

      if (scrollPosition >= halfwayPoint) {
        loadMoreItems();
      }
    };

    const ul = listRef.current;
    if (ul) {
      ul.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (ul) {
        ul.removeEventListener("scroll", handleScroll);
      }
    };  }, [loadMoreItems]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const ul = listRef.current;
      switch (event.key) {
        case "ArrowDown":
          setFocusedIndex((prevIndex) =>
            Math.min(prevIndex + 5, moviesList.length - 1)
          );
          // Scroll down when ArrowDown is pressed
          if (ul) {
            const focusedElement = ul.children[Math.min(focusedIndex + 5, moviesList.length - 1)];
            if (focusedElement) {
              focusedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }
          }
          break;
        case "ArrowUp":
          setFocusedIndex((prevIndex) => Math.max(prevIndex - 5, 0));
          // Scroll up when ArrowUp is pressed
          if (ul) {
            const focusedElement = ul.children[Math.max(focusedIndex - 5, 0)];
            if (focusedElement) {
              focusedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }
          }
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
  }, [focusedIndex, moviesList, handleMovieClick, moviesList.length]);

  return (
    <div>
      <ul ref={listRef} className="movies-list">
        {visibleMovies.map((movie, index) => (
          <li
            className={`movie ${
              focusedIndex === index && isFocused === 2 ? "focused" : ""
            }`}
            key={index}
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
