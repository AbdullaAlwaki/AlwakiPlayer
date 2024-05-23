import React, { useState, useEffect, useContext } from "react";
import { Context } from "../Util/createContext";

const MoviesList = () => {
  const [movieCategories, setMovieCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [moviesList, setMoviesList] = useState([]);
  const { serverUrl, username, password, mainUrl, setUrlPlayer } =
    useContext(Context);
  useEffect(() => {
    const fetchMovieCategories = async () => {
      const url = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_categories`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        setMovieCategories(data);
      } catch (error) {
        console.error("Error fetching movie categories:", error);
      }
    };

    fetchMovieCategories();
  }, [serverUrl, username, password]);

  const handleCategoryClick = async (categoryId) => {
    setSelectedCategory(categoryId);
    setUrlPlayer("");
    const url = `${mainUrl}&action=get_vod_streams&category_id=${categoryId}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);
      setMoviesList(data);
    } catch (error) {
      console.error("Error fetching movies list:", error);
    }
  };
  const handleMovieClick = async (movieId) => {
    const url = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_info&vod_id=${movieId}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      const streamUrl =
        data.movie_data.direct_source ||
        `${serverUrl}/movie/${username}/${password}/${movieId}.${data.movie_data.container_extension}`;
      setUrlPlayer(streamUrl);
    } catch (error) {
      console.error("Error fetching movie details:", error);
    }
  };

  return (
    <div>
      <h2>Movie Categories</h2>
      <ul>
        {movieCategories.map((category) => (
          <li
            key={category.category_id}
            onClick={() => handleCategoryClick(category.category_id)}
          >
            {category.category_name}
            {selectedCategory === category.category_id && (
              <ul>
                {moviesList.map((movie) => (
                  <li
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
  );
};

export default MoviesList;
