import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../Util/createContext";
import Player from "../../Util/Player";
import MovieList from "./MovieList";
import "../../Style/MoviesList.scss";

const MoviesCategoriesList = () => {
  const [movieCategories, setMovieCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [moviesList, setMoviesList] = useState([]);
  const { serverUrl, username, password, setError, setLoading, loading } = useContext(Context);

  let favoriteList =
    JSON.parse(localStorage.getItem("favoriteListMovie")) || [];

  const vodCategories = JSON.parse(sessionStorage.getItem("vodCategories"));

  useEffect(() => {
    if (vodCategories) {
      if (vodCategories[1].category_name === "Favorites") {
        vodCategories[1].count = favoriteList.length;
      } 
      setMovieCategories(vodCategories);
    } else {
      const fetchVodData = async () => {
        setLoading(true);
        try {
          const vodCategoriesResponse = await fetch(
            `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_categories`
          );
          const vodCategoriesData = await vodCategoriesResponse.json();
          setMovieCategories(vodCategoriesData);
          vodCategoriesData.unshift(
            { category_id: "0", category_name: "All" },
            { category_id: "1", category_name: "Favorites" }
          );

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

          const vodAllStreamsData = await Promise.all(
            vodCategoriesData.map(async (category) => {
              const count = await fetchCountForCategory(category);
              return { [category.category_id]: count };
            })
          );

          const vodCategoryWithCount = vodCategoriesData.map((category) => {
            const count = vodAllStreamsData.find(
              (count) => category.category_id in count
            )[category.category_id];
            return { ...category, count: count };
          });

          sessionStorage.setItem(
            "vodCategories",
            JSON.stringify(vodCategoryWithCount)
          );
          setMovieCategories(vodCategoryWithCount);
          setLoading(false);
        } catch (error) {
          setError(error);
        }
      };
      fetchVodData();
    }
    // eslint-disable-next-line
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

  return (
    <div className="movie-categories-container">
      <div className="player-container">
        <Player />
      </div>
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
                <span className="category-count"
                >{category.count}</span>
              </h1>

              {selectedCategory === category.category_id && (
                <MovieList
                  moviesList={moviesList}
                  favoriteList={favoriteList}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MoviesCategoriesList;
