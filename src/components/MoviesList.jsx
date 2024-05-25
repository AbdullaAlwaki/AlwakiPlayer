import React, { useState, useEffect, useContext } from "react";
import { Context } from "../Util/createContext";
import Player from "../Util/Player";
import "../Style/MoviesList.scss";

const MoviesList = () => {
  const [movieCategories, setMovieCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [moviescat, setMoviesCat] = useState({});
  const [moviesList, setMoviesList] = useState([]);
  const { serverUrl, username, password, setUrlPlayer, setError } =
    useContext(Context);

  useEffect(() => {
    const vodCategories = JSON.parse(sessionStorage.getItem("vodCategories"));
    if (vodCategories) {
      setMovieCategories(vodCategories);
    }
  }, [serverUrl, username, password]);

  useEffect(() => {
    const fetchMovieCountForCategories = async () => {
      const fetchCountForCategory = async (category) => {
        try {
          const response = await fetch(
            `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_streams&category_id=${category.category_id}`
          );
          const data = await response.json();
          return data.length;
        } catch (error) {
          setError("Error fetching movies count for category:", error);
        }
      };

      const counts = await Promise.all(
        movieCategories.map(async (category) => {
          const count = await fetchCountForCategory(category);
          return { [category.category_id]: count };
        })
      );
      
      const countsObject = counts.reduce((acc, countObj) => ({ ...acc, ...countObj }), {});
      setMoviesCat(countsObject);
    };

    if (movieCategories.length > 0) {
      fetchMovieCountForCategories();
    }
  }, [movieCategories, serverUrl, username, password, setError]);

  const handleCategoryClick = async (categoryId) => {
    setSelectedCategory(categoryId);
    try {
      const response = await fetch(
        `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_categories&action=get_vod_streams&category_id=${categoryId}`
      );
      const data = await response.json();
      setMoviesList(data);
    } catch (error) {
      setError("Error fetching movies list:", error);
    }
  };
  const handleMovieClick = async (movieId) => {
    try {
      const response = await fetch(
        `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_info&vod_id=${movieId}`
      );
      const data = await response.json();
      console.log(data);
      const streamUrl =
        data.movie_data.direct_source ||
        `${serverUrl}/movie/${username}/${password}/${movieId}.${data.movie_data.container_extension}`;
      setUrlPlayer(streamUrl);
    } catch (error) {
      setError("Error fetching movie details:", error);
    }
  };
  return (
    <div className="movie-categories-container">
      <h2>Movie Categories</h2>
      <div className="player-container">
        <Player />
      </div>
      <div className="movie-categories-list">
        <ul className="movie-categories">
          {movieCategories.map((category) => (
            <li
              className="movie-category"
              key={category.category_id}
              onClick={() => handleCategoryClick(category.category_id)}
            >
              {category.category_name}
              {moviescat[category.category_id] && (
                <span className="movie-count">
                  {moviescat[category.category_id]}
                </span>
              )}
              {selectedCategory === category.category_id && (
                <ul className="movies-list">
                  {moviesList.map((movie) => (
                    <li
                      className="movie"
                      key={movie.stream_id}
                      onClick={() => handleMovieClick(movie.stream_id)}
                    >
                      {movie.name}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MoviesList;
