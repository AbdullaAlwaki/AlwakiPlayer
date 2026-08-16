import { useEffect, useRef } from "react";
import logo from "../../assets/logo.png";
import PropTypes from "prop-types";

export default function SeriesDataSeasons({
  seriesData,
  setSeasonNum,
  setSeriesData,
  focusIndex,
  setFocusIndex,
  isFocused,
  setIsFocused,
}) {
  const itemsRef = useRef([]);

  const seasonData = (e) => {
    setSeasonNum(e.season_number);
    setSeriesData({
      ...seriesData,
      info: {
        ...seriesData.info,
        name: e.name,
        cover: e.cover,
        plot: e.overview || seriesData?.info?.plot,
      },
    });
  };

  // ⬅➡ التحكم بالأسهم
  useEffect(() => {
    if (isFocused !== 2) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        setFocusIndex((prev) =>
          prev < seriesData?.seasons?.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowLeft") {
        setFocusIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocused, focusIndex, seriesData?.seasons?.length]);

useEffect(() => {
  if (isFocused === 2 && itemsRef.current[focusIndex]) {
    const el = itemsRef.current[focusIndex];
    const container = el.parentNode; // الـ div الأساسي (seriesData_seasons)

    const containerWidth = container.clientWidth;
    const elOffsetLeft = el.offsetLeft;
    const elWidth = el.clientWidth;

    // حساب بحيث العنصر بالنص أفقيًا
    const scrollLeft =
      elOffsetLeft - containerWidth / 2 + elWidth / 2;

    container.scrollTo({
      left: scrollLeft,
      behavior: "smooth",
    });
  }
}, [focusIndex, isFocused]);

  return (
    <div className="seriesData_seasons">
      {seriesData?.seasons?.map((season, index) => (
        <div
          className={`seasons ${
            isFocused === 2 && focusIndex === index ? "episods-focused" : ""
          }`}
          onMouseEnter={() => setFocusIndex(index)}
          key={index}
          onClick={() => seasonData(season)}
          ref={(el) => (itemsRef.current[index] = el)}
        >
          <span className="seasons_icon">
            <img src={season.cover ? season.cover : logo} alt="" />
          </span>

          <p className="seasons_name">
            <span>{season.name}</span>
            {seriesData?.episodes[index + 1]?.length}
          </p>
        </div>
      ))}
    </div>
  );
}

SeriesDataSeasons.propTypes = {
  seriesData: PropTypes.shape({
    seasons: PropTypes.array,
    info: PropTypes.object,
    episodes: PropTypes.object,
  }).isRequired,
  setSeasonNum: PropTypes.func.isRequired,
  setSeriesData: PropTypes.func.isRequired,
};
