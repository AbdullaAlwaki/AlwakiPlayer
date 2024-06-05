import React, { useState, useEffect, useContext, useRef } from "react";
import { Context } from "../../Util/createContext";
import { fetchData } from "../../Util/helperfunction";
import MovieList from "./MovieList";
import "../../Style/MoviesList.scss";

const MoviesCategoriesList = () => {
  const [movieCategories, setMovieCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [moviesList, setMoviesList] = useState([]);
  const [close, setClose] = useState(false);
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
    // eslint-disable-next-line
  }, [
    serverUrl,
    username,
    password,
    setLoading,
    setError,
    favoriteList.length
  ]);

  useEffect(() => {
    if (close) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
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
    <div className="movie-categories-container">
      <div className="movie-categories-list-container">
        <ul className="movie-categories">
          {movieCategories?.map((category) => (
            <li
              className="movie-category"
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
                    <MovieList moviesList={moviesList} />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MoviesCategoriesList;
