import { useEffect, useContext, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Context } from "../createContext";
import SeriesEpisodes from "./SeriesEpisodes";
import SeriesDataSeasons from "./SeriesDataSeasons";
import Carusel from "../Carusel";
import SeriesDataInfo from "./Series_dataInfo";
import SeriesDataInfoDetails from "./SeriesDataInfoDetails";
import logo from "../../assets/Untitled-1.png";

import "./SeriesData.scss";
import ListDivision from "../../components/ListDivision";

export default function SeriesData() {
  const [seriesData, setSeriesData] = useState({});
  const [index, setIndex] = useState(0);
  const [seasonNum, setSeasonNum] = useState(1);
  const [close, setClose] = useState(false);
  const [isFocused, setIsFocused] = useState(1);
  const [focusIndex, setFocusIndex] = useState(0);

  const {
    serverUrl,
    username,
    password,
    setUrlPlayer,
    setError,
    setClosePlayer,
  } = useContext(Context);

  const seriesDataListRef = useRef();

  const idx = useParams().id;
  const id = idx.slice(1);
  const backdropImg = seriesData?.info?.backdrop_path || [];

  useEffect(() => {
    if (idx.startsWith("s")) {
      const fetchData = async () => {
        const response = await fetch(
          `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_series_info&series_id=${id}`
        );
        const data = await response.json();
        let episodes = Object.keys(data.episodes || []).length;
        if (!data.seasons) {
          data.seasons = [];
        }
        let seasons = Object.keys(data.seasons || []).length + 1;
        if (!episodes !== seasons) {
          for (let i = seasons; i <= episodes; i++) {
            data?.seasons?.push({
              air_date: data.info.releaseDate,
              cover: data.info.cover,
              cover_big: data.info.cover_big,
              episode_count: data.info.episode_count,
              id: data.info.id,
              name: `Seasson ${i}`,
              overview: data.info.plot,
              season_number: i,
            });
          }
        }
        setSeriesData(data);
      };
      fetchData();
      
    } else if (idx.startsWith("m")) {
      const fetchData = async () => {
        const response = await fetch(
          `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_info&vod_id=${id}`
        );
        const data = await response.json();
        setSeriesData(data);
      };
      fetchData();
    }

    const interval = setInterval(() => {
      setIndex(
        (prevIndex) => (prevIndex + 1) % seriesData?.info?.backdrop_path?.length
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [
    id,
    serverUrl,
    username,
    password,
    setUrlPlayer,
    setIndex,
    seriesData?.info?.backdrop_path?.length,
  ]);

  if (backdropImg.length === 0) {
    backdropImg.push(logo);
  }

  const seasons_count = Object.values(seriesData?.episodes || []);

  const handleClickOutside = (event) => {
    if (
      seriesDataListRef.current &&
      !seriesDataListRef.current.contains(event.target)
    ) {
      setClose(false);
    }
  };

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

  const clickOutsideEpisods = (e) => {
    if (e.target.classList.contains("series_episodes_con")) {
      setClose(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "backspace" || e.key === "Escape") {
        if (isFocused === 3) {
          setClose(false);
          setIsFocused(1);
        }
      } else if (e.key === "down" || e.key === "ArrowDown") {
        if (seriesData.movie_data && isFocused === 1) {
          setIsFocused((prevIndex) => Math.min(prevIndex + 1, 2));
          return;
        } else if (isFocused === 1) {
          setIsFocused((prevIndex) => Math.min(prevIndex + 1, 3));
        }
      } else if (e.key === "up" || e.key === "ArrowUp") {
        setIsFocused((prevIndex) => Math.max(prevIndex - 1, 0));
      } else if (e.key === "right" || e.key === "ArrowRight") {
        if (isFocused === 0) {
          setIsFocused(1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocused, focusIndex, close]);
  
  return (
    <>
      <ListDivision isFocused={isFocused === 0} />
      <div className="seriesData">
        <Carusel index={index} backdropImg={backdropImg} />
        <div className="Data_info">
          <SeriesDataInfo
            seriesData={seriesData}
            focusIndex={focusIndex}
            setFocusIndex={setFocusIndex}
            isFocused={isFocused}
            setIsFocused={setIsFocused}
            seasons_count={seasons_count}
            id={id}
            wt={idx}
            setClose={setClose}
            setError={setError}
            setUrlPlayer={setUrlPlayer}
            setClosePlayer={setClosePlayer}
          />
          {!seriesData.movie_data && (
            <SeriesDataSeasons
              seriesData={seriesData}
              setSeasonNum={setSeasonNum}
              setSeriesData={setSeriesData}
              focusIndex={focusIndex}
              setFocusIndex={setFocusIndex}
              isFocused={isFocused}
              setIsFocused={setIsFocused}
            />
          )}
          <SeriesDataInfoDetails seriesData={seriesData} />
          {close ? (
            <div className="series_episodes_con" onClick={clickOutsideEpisods}>
              <SeriesEpisodes
                focusIndex={focusIndex}
                setFocusIndex={setFocusIndex}
                isFocused={isFocused}
                setIsFocused={setIsFocused}
                episodes={seasons_count[seasonNum - 1] || ""}
              />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
