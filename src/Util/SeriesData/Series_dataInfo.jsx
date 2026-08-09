import React, { useState, useEffect } from "react";
import star from "../../assets/star.png";
import fillStar from "../../assets/fillStar.png";
import { data, useNavigate } from "react-router-dom";

export default function Series_dataInfo({
  seriesData,
  seasons_count,
  id,
  wt,
  setClose,
  setError,
  setUrlPlayer,
  setClosePlayer,
  isFocused,
  setIsFocused,
  focusIndex,
  setFocusIndex,
}) {
  const [favoriteList, setFavoriteList] = useState(
    JSON.parse(localStorage.getItem("favoriteListSeries")) || []
  );
  const navigate = useNavigate();

  const hasTrailer = seriesData?.info?.youtube_trailer !== "";

  const isPlayed = localStorage.getItem("TimeOfVOD")?.includes(id);

  const handelSeriesClick = () => {
    setIsFocused(3);
    setError("");
    setClose(true);
  };

  const handleTrailerClick = () => {
    navigate(`/trailer/${seriesData?.info?.youtube_trailer}`);
  };

  const handelMovieClick = () => {
    setUrlPlayer({ idx: 0, data: seriesData });
    setError("");
    navigate("/player");
  };

  const inFavorite = () => favoriteList.some((item) => item === seriesData);

  const handleFavorite = () => {
    const isIn = favoriteList.some((item) => item === seriesData);
    const updatedFavoriteList = isIn
      ? favoriteList.filter((item) => item !== seriesData)
      : [...favoriteList, seriesData];

    const whatType = wt.startsWith("s") ? "Series" : "Movie";

    setFavoriteList(updatedFavoriteList);
    localStorage.setItem(
      `favoriteList${whatType}`,
      JSON.stringify(updatedFavoriteList)
    );
    window.dispatchEvent(
      new CustomEvent("favorites-updated", {
        detail: { key: `favoriteList${whatType}` },
      })
    );
  };

  useEffect(() => {
    if (isFocused !== 1) return;
    if (isFocused === 1 && focusIndex > 2) {
      setFocusIndex(2);
    }

    const buttonCount = hasTrailer ? 3 : 2;

    const handleKeyDown = (e) => {
      console.log("focusIndex:", focusIndex, "keyCode:", e.keyCode);

      if (e.key === "ArrowRight") {
        setFocusIndex((prev) => (prev < buttonCount - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowLeft") {
        if (focusIndex == 0) {
          setIsFocused(0);
          return;
        }
        setFocusIndex((prev) => (prev > 0 ? prev - 1 : prev)); // لا يتجاوز أول زر
      } else if (e.key === "Enter") {
        if (focusIndex === 0) {
          if (seriesData?.movie_data) return handelMovieClick();
          return handelSeriesClick();
        } else if (focusIndex === 1) {
          if (!hasTrailer) return handleFavorite();
          return handleTrailerClick();
        } else if (focusIndex === 2) {
          return handleFavorite();
        }
      } else if (e.key === "Escape" || e.key === "Backspace") {
        navigate(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusIndex, hasTrailer, isFocused]);

  return (
    <div className="seriesData_info">
      <div className="seriesData_info_text">
        <p className="seriesData_info_text_title">
          {seriesData?.info?.name || seriesData?.movie_data?.name}
        </p>

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
          {seriesData?.movie_data ? (
            <button
              onClick={handelMovieClick}
              className={isFocused === 1 && focusIndex === 0 ? "focused" : ""}
              onMouseEnter={() => setFocusIndex(0)}
            >
              {isPlayed ? "متابعة المشاهدة" : "تشغيل"}
            </button>
          ) : (
            <button
              onClick={handelSeriesClick}
              className={isFocused === 1 && focusIndex === 0 ? "focused" : ""}
              onMouseEnter={() => setFocusIndex(0)}
            >
              الحلقات
            </button>
          )}

          {/* Trailer */}
          {hasTrailer && (
            <button
              onClick={() => handleTrailerClick()}
              className={isFocused === 1 && focusIndex === 1 ? "focused" : ""}
              onMouseEnter={() => setFocusIndex(1)}
            >
              الاعلان
            </button>
          )}

          {/* Favorite */}
          <button
            onClick={handleFavorite}
            onMouseEnter={() => setFocusIndex(hasTrailer ? 2 : 1)}
            className={`favorite_icon ${
              isFocused === 1 &&
              ((!hasTrailer && focusIndex === 1) ||
                (hasTrailer && focusIndex === 2))
                ? "focused"
                : ""
            }`}
          >
            <img src={inFavorite() ? fillStar : star} alt="" />
          </button>
        </div>
      </div>

      <div className="seriesData_image">
        <p>{seriesData?.info?.age}</p>
        <img
          src={seriesData?.info?.cover || seriesData?.info?.movie_image}
          alt="cover"
        />
      </div>
    </div>
  );
}
