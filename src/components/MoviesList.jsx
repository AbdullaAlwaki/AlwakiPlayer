import React, { useState, useEffect, useContext } from "react";
import { Context } from "../Util/createContext";
import Player from "../Util/Player";
import "../Style/MoviesList.scss";

const MoviesList = () => {
  const [movieCategories, setMovieCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [moviesList, setMoviesList] = useState([]);
  const { serverUrl, username, password, setUrlPlayer, setError, urlPlayer } =
    useContext(Context);

  useEffect(() => {
    const vodCategories = JSON.parse(sessionStorage.getItem("vodCategories"));
    if (vodCategories) {
      setMovieCategories(vodCategories);
    }
  }, [serverUrl, username, password]);

  const handleCategoryClick = async (categoryId) => {
    setSelectedCategory(categoryId);
    try {
      const response = await fetch(
        `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_streams&category_id=${categoryId}`
      );
      const data = await response.json();
      setMoviesList(data);
    } catch (error) {
      setError("Error fetching movies list:", error);
    }
  };
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

  return (
    <div className="movie-categories-container">
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
              <span>{category.category_name}</span>
              <span>{category.count}</span>
              {movieCategories[category.category_id] && (
                <span className="movie-count">
                  {movieCategories[category.category_id].length}
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
                      <span className="movie-name">{movie.name}</span>
                      <span className="movie-icon">
                        <img src={movie.stream_icon} alt="" />
                      </span>
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
