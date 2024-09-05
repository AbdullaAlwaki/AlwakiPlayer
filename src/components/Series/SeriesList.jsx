import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../Util/createContext";
import Logo from "../../assets/logo.png";

import "./SeriesList.scss";

export default function Series({ seriesList, isFocused }) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { setError } = useContext(Context);
  const navigate = useNavigate();

  const [visibleSeries, setVisibleSeries] = useState([]);
  const [loadedItems, setLoadedItems] = useState(0);
  const itemsPerLoad = 20;

  const listRef = useRef(null);

  useEffect(() => {
    loadMoreItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const ul = listRef.current;
      const scrollPosition = ul.scrollTop + ul.clientHeight;
      const halfwayPoint = ul.scrollHeight / 2;

      if (scrollPosition >= halfwayPoint) {
        loadMoreItems();
      }
    };

    const ul = listRef.current;
    if (ul) {
      ul.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (ul) {
        ul.removeEventListener("scroll", handleScroll);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedItems]);

  const loadMoreItems = () => {
    const moreItems = seriesList.slice(loadedItems, loadedItems + itemsPerLoad);
    setVisibleSeries((prevMovies) => [...prevMovies, ...moreItems]);
    setLoadedItems((prevCount) => prevCount + itemsPerLoad);
  };

  const handleSeriesClick = useCallback((seriesId) => {
    setError(null);
    navigate(`/series/${seriesId}`);
  },[navigate, setError]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const ul = listRef.current;
      switch (event.key) {
        case "ArrowDown":
          setFocusedIndex((prevIndex) =>
            Math.min(prevIndex + 5, seriesList.length - 1)
          );
          // Scroll down when ArrowDown is pressed
          if (ul) {
            const focusedElement =
              ul.children[Math.min(focusedIndex + 5, seriesList.length - 1)];
            if (focusedElement) {
              focusedElement.scrollIntoView({
                block: "nearest",
                behavior: "smooth",
              });
            }
          }
          break;
        case "ArrowUp":
          setFocusedIndex((prevIndex) => Math.max(prevIndex - 5, 0));
          // Scroll up when ArrowUp is pressed
          if (ul) {
            const focusedElement = ul.children[Math.max(focusedIndex - 5, 0)];
            if (focusedElement) {
              focusedElement.scrollIntoView({
                block: "nearest",
                behavior: "smooth",
              });
            }
          }
          break;
        case "ArrowLeft":
          setFocusedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
          break;
        case "ArrowRight":
          setFocusedIndex((prevIndex) =>
            Math.min(prevIndex + 1, seriesList.length - 1)
          );
          break;
        case "Enter":
          handleSeriesClick(seriesList[focusedIndex].stream_id);
          break;
        default:
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [focusedIndex, seriesList, handleSeriesClick]);

  return (
    <div>
      <ul ref={listRef} className="series_list">
        {visibleSeries.map((series, index) => (
          <li
            className={`series ${
              focusedIndex === index && isFocused === 2 ? "focused" : ""
            }`}
            key={index}
            onClick={() => handleSeriesClick(series.series_id)}
          >
            <span className="series-icon">
              <img
                src={series.cover ? `${series.cover}` : { Logo }}
                alt={series.name}
              />
            </span>
            <span className="series_name">{series.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
