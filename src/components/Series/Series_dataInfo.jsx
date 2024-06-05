import React, { useState } from 'react';
import star from "../../assets/star.png";
import fillStar from "../../assets/fillStar.png";


export default function Series_dataInfo({seriesData, seasons_count, id, setClose, setError, setUrlPlayer, setClosePlayer}) {
    const [favoriteList, setFavoriteList] = useState(
        JSON.parse(localStorage.getItem("favoriteListSeries")) || []
      );
      
    const handelSeriesClick = () => {
        setError("");
        setClose(true);
      };
    
      const handleTrailerClick = () => {
        setClosePlayer(true)
        setError("");
        setUrlPlayer(
          `https://www.youtube.com/embed/${seriesData?.info?.youtube_trailer}`
        );
      };
    
      const inFavorite = () => {
        return favoriteList.some((item) => item === id.id);
      };
    
      const handleFavorite = () => {
        const isIn = favoriteList.some((item) => item === id.id);
    
        let updatedFavoriteList;
        if (!isIn) {
          updatedFavoriteList = [...favoriteList, id.id];
        } else {
          updatedFavoriteList = favoriteList.filter((item) => item !== id.id);
        }
        setFavoriteList(updatedFavoriteList);
        localStorage.setItem(
          "favoriteListSeries",
          JSON.stringify(updatedFavoriteList)
        );
      };
  return (
    <div className="seriesData_info">
    <div className="seriesData_info_text">
      <p className="seriesData_info_text_title">{seriesData?.info?.name}</p>
      <div className="seriesData_info_text_info">
        <p className="seriesData_info_text_genre">
          {seriesData?.info?.genre}
        </p>
        <p className="seriesData_info_text_rating">
          {seriesData?.info?.rating}
          <span>&#9733;</span>
        </p>
        <p>{seasons_count?.length || 1}</p>
      </div>
      <p className="seriesData_info_text_description">
        {seriesData?.info?.plot}
      </p>
      <div className="seriesData_info_text_buttons">
        <button onClick={() => handelSeriesClick()}>Episodes</button>

        {seriesData?.info?.youtube_trailer === "" ? null : (
          <button onClick={handleTrailerClick}> Trailer </button>
        )}
        <button onClick={handleFavorite} className="favorite_icon">
          <img src={inFavorite() ? fillStar : star} alt="" width={"30px"} />
        </button>
      </div>
    </div>

    <div className="seriesData_image">
      <p>{seriesData?.info?.age}</p>
      <img src={seriesData?.info?.cover} alt="cover" />
    </div>
  </div>
  )
}
