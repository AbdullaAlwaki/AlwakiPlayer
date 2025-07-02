import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { Context } from "../../Util/createContext";
import { fetchData } from "../../Util/helperfunction";
import ListDivision from "../ListDivision";
import MovieList from "./MovieList";
import "./MoviesList.scss";

const MoviesCategoriesList = () => {
  const [movieCategories, setMovieCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [moviesList, setMoviesList] = useState([]);
  const [close, setClose] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(1);
  const [favoriteList, setFavoriteList] = useState([]);
  const [vodCategories, setVodCategories] = useState(null);

  const { serverUrl, username, password, setError, setLoading } = useContext(Context);
  const movieDataListRef = useRef(null);
  const itemRefs = useRef([]);

  // Load favoriteList from localStorage on mount
  useEffect(() => {
    const fav = JSON.parse(localStorage.getItem("favoriteListMovie")) || [];
    setFavoriteList(fav);
  }, []);

  // Load vodCategories from sessionStorage on mount
  useEffect(() => {
    const vod = JSON.parse(sessionStorage.getItem("vodCategories"));
    setVodCategories(vod);
  }, []);

  useEffect(() => {
    if (vodCategories) {
      const updated = [...vodCategories];
      if (updated[1] && updated[1].category_name === "Favorites") {
        updated[1].count = favoriteList.length;
      }
      setMovieCategories(updated);
    } else {
      fetchData(
        setLoading,
        serverUrl,
        username,
        password,
        setMovieCategories,
        setError,
        "vod",
        "vod_streams"
      );
    }
  }, [vodCategories, favoriteList.length, serverUrl, username, password, setLoading, setError]);

  const loadCategoryData = useCallback(async (categoryId) => {
    if (categoryId === "1") {
      setMoviesList(favoriteList);
      setSelectedCategory(categoryId);
      setClose(true);
      return;
    }
    
    setSelectedCategory(categoryId);
    try {
      const response = await fetch(
        `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_streams&category_id=${categoryId}`
      );
      const data = await response.json();
      setMoviesList(data);
      setClose(true);
    } catch (error) {
      setError("Error fetching movies list:", error);
    }
  }, [serverUrl, username, password, setError, favoriteList, setMoviesList, setSelectedCategory, setClose]);

  const handleCategoryClick = useCallback((categoryId) => {
    // If clicking the same category that's already open, close it with animation
    if (selectedCategory === categoryId && close) {
      const movieDataList = document.querySelector('.movie_data_list');
      if (movieDataList) {
        movieDataList.classList.add('closing');
        setTimeout(() => {
          setSelectedCategory(null);
          setClose(false);
        }, 300);
      } else {
        setSelectedCategory(null);
        setClose(false);
      }
      return;
    }
    
    // If a different category is already open, close it first with animation
    if (selectedCategory && selectedCategory !== categoryId && close) {
      const movieDataList = document.querySelector('.movie_data_list');
      if (movieDataList) {
        movieDataList.classList.add('closing');
        setTimeout(() => loadCategoryData(categoryId), 300);
      } else {
        loadCategoryData(categoryId);
      }
    } else {
      // No category is open, just load the new one
      loadCategoryData(categoryId);
    }
  }, [selectedCategory, close, loadCategoryData, setSelectedCategory, setClose]);
  
  const handleKeyDown = useCallback((event) => {
    // Prevent default behavior for navigation keys
    if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Enter", "Backspace"].includes(event.key)) {
      event.preventDefault();
    }

    switch (event.key) {
      case "ArrowDown":
        if (isFocused === 1) {
          setFocusedIndex((prevIndex) => {
            const newIndex = Math.min(prevIndex + 1, movieCategories.length - 1);
            // Smooth scroll into view
            itemRefs.current[newIndex]?.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });
            return newIndex;
          });
        }
        break;
      case "ArrowUp":
        if (isFocused === 1) {
          setFocusedIndex((prevIndex) => {
            const newIndex = Math.max(prevIndex - 1, 0);
            // Smooth scroll into view
            itemRefs.current[newIndex]?.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });
            return newIndex;
          });
        }
        break;
      case "ArrowLeft":
        if (isFocused === 1) {
          setIsFocused((prevIndex) => Math.max(prevIndex - 1, 0));
        }
        break;
      case "ArrowRight":
        if (selectedCategory === movieCategories[focusedIndex]?.category_id) {
          setIsFocused((prevIndex) => Math.min(prevIndex + 1, 2));
        } else {
          setIsFocused((prevIndex) => Math.min(prevIndex + 1, 1));
        }
        break;
      case "Enter":
        if (isFocused === 1) {
          if (selectedCategory === movieCategories[focusedIndex]?.category_id && close) {
            // Add a class for exit animation
            const movieDataList = document.querySelector('.movie_data_list');
            if (movieDataList) {
              movieDataList.classList.add('closing');
              setTimeout(() => {
                setSelectedCategory(null);
                setClose(false);
              }, 300);
            } else {
              setSelectedCategory(null);
              setClose(false);
            }
          } else {
            // Otherwise open the selected category
            handleCategoryClick(movieCategories[focusedIndex]?.category_id);
            setIsFocused(2);
          }
        }
        break;
      case "Backspace":
        if (selectedCategory) {
          // Add a class for exit animation
          const movieDataList = document.querySelector('.movie_data_list');
          if (movieDataList) {
            movieDataList.classList.add('closing');
            // Wait for animation to complete before actually closing
            setTimeout(() => {
              setSelectedCategory(null);
              setIsFocused(1);
            }, 300); // Match this with the CSS animation duration
          } else {
            setSelectedCategory(null);
            setIsFocused(1);
          }
        }
        break;
      default:
        break;
    }
  }, [isFocused, focusedIndex, movieCategories, selectedCategory, handleCategoryClick, close, setSelectedCategory, setClose, setIsFocused]);

  useEffect(() => {
    // Use capture phase to handle events before they bubble
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (close) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    if(!close){
      setIsFocused(2)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [close]);

  const handleClickOutside = (event) => {
    if (
      movieDataListRef.current &&
      !movieDataListRef.current.contains(event.target)
    ) {
      // Add a class for exit animation
      const movieDataList = document.querySelector('.movie_data_list');
      if (movieDataList) {
        movieDataList.classList.add('closing');
        // Wait for animation to complete before actually closing
        setTimeout(() => {
          setClose(false);
        }, 300); // Match this with the CSS animation duration
      } else {
        setClose(false);
      }
    }
  };
  return (
    <>
      <ListDivision isFocused={isFocused === 0} />
      <div className="movie-categories-container" role="region" aria-label="Movie Categories">
        <div className="movie-categories-list-container">
          <ul 
            className="movie-categories" 
            role="listbox" 
            aria-activedescendant={`category-${focusedIndex}`}
            tabIndex="0"
          >
            {movieCategories?.map((category, index) => (
              <li
                ref={el => (itemRefs.current[index] = el)}
                className={`movie-category ${
                  focusedIndex === index && isFocused === 1 ? "focused" : ""
                } ${selectedCategory === category.category_id ? "selected" : ""}`}
                key={category.category_id}
                onClick={() => handleCategoryClick(category.category_id)}
                role="option"
                aria-selected={selectedCategory === category.category_id}
                id={`category-${index}`}
                tabIndex={focusedIndex === index && isFocused === 1 ? 0 : -1}
              >
                <h1 className="category-name">
                  {category.category_name}
                  <span className="category-count" aria-label={`${category.count} items`}>
                    {category.count}
                  </span>
                </h1>

                {selectedCategory === category.category_id && close && (
                  <div className="movie_data_list" role="region" aria-label="Movie List">
                    <div ref={movieDataListRef}>
                      <MovieList moviesList={moviesList} isFocused={isFocused} />
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default MoviesCategoriesList;
