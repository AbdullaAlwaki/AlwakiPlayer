import React, { useState, useEffect, useContext, useRef } from "react";
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

  const { serverUrl, username, password, setError, setLoading } =
    useContext(Context);
  const movieDataListRef = useRef(null);

  const favoriteList =
    JSON.parse(localStorage.getItem("favoriteListMovie")) || [];

  const vodCategories = JSON.parse(sessionStorage.getItem("vodCategories"));

  useEffect(() => {
    if (vodCategories) {
      if (vodCategories[1].category_name === "Favorites") {
        vodCategories[1].count = favoriteList.length;
      }
      setMovieCategories(vodCategories);
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

    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowDown":
          if (isFocused === 1) {
            setFocusedIndex((prevIndex) =>
              Math.min(prevIndex + 1, movieCategories.length)
            );
          }
          break;
        case "ArrowUp":
          if (isFocused === 1)
            setFocusedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
          break;
        case "ArrowLeft":
          if (isFocused === 1)
            setIsFocused((prevIndex) => Math.max(prevIndex - 1, 0));
          break;
        case "ArrowRight":
          if ( selectedCategory === movieCategories[focusedIndex]?.category_id){
          setIsFocused((prevIndex) => Math.min(prevIndex + 1, 2));} else {
            setIsFocused((prevIndex) => Math.min(prevIndex + 1, 1));
          }
          break;
        case "Enter":
          if (isFocused === 1) {
            handleCategoryClick(movieCategories[focusedIndex]?.category_id);
            setIsFocused(2);
          }
          break;
          case "Backspace":
            setSelectedCategory(null)
            setIsFocused(1)
          break;
        default:
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line
  }, [
    serverUrl,
    username,
    password,
    setLoading,
    setError,
    favoriteList.length,
    focusedIndex,
    isFocused
  ]);

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

  const handleCategoryClick = async (categoryId) => {
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
  };

  const handleClickOutside = (event) => {
    if (
      movieDataListRef.current &&
      !movieDataListRef.current.contains(event.target)
    ) {
      setClose(false);
    }
  };
  return (
    <>
      <ListDivision  isFocused={isFocused === 0}/>
      <div className="movie-categories-container">
        <div className="movie-categories-list-container">
          <ul className="movie-categories">
            {movieCategories?.map((category, index) => (
              <li
                className={`movie-category ${
                  focusedIndex === index && isFocused === 1 ? "focused" : ""
                } ${selectedCategory === category.category_id ? "selected" : ""}`}
                key={category.category_id}
                onClick={() => handleCategoryClick(category.category_id)}
                
              >
                <h1 className="category-name">
                  {category.category_name}
                  <span className="category-count">{category.count}</span>
                </h1>

                {selectedCategory === category.category_id && close && (
                  <div className="movie_data_list">
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
