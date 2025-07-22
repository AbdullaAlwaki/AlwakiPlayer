import React, { useEffect, useContext, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Context } from "../../Util/createContext";
import SeriesEpisodes from "./SeriesEpisodes";
import SeriesDataSeasons from "./SeriesDataSeasons";
import Carusel from "../../Util/Carusel";
import SeriesDataInfo from "./Series_dataInfo";
import SeriesDataInfoDetails from "./SeriesDataInfoDetails";
import logo from "../../assets/Untitled-1.png";

import "./SeriesData.scss";

export default function SeriesData() {
  const [seriesData, setSeriesData] = useState({});
  const [index, setIndex] = useState(0);
  const [seasonNum, setSeasonNum] = useState(1);
  const [close, setClose] = useState(false);

  const { serverUrl, username, password, setUrlPlayer, setError, setClosePlayer } =
    useContext(Context);
  const seriesDataListRef = useRef();
  const id = useParams();
  const backdropImg = seriesData?.info?.backdrop_path || [];
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_series_info&series_id=${id.id}`
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
    
    const interval = setInterval(() => {
      setIndex(
        (prevIndex) => (prevIndex + 1) % seriesData?.info?.backdrop_path?.length
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [id, serverUrl, username, password, setUrlPlayer, setIndex,seriesData?.info?.backdrop_path?.length]);
  
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
  return (
    <div className="seriesData">
      <Carusel index={index} backdropImg={backdropImg} />

      <SeriesDataInfo
        seriesData={seriesData}
        seasons_count={seasons_count}
        id={id}
        setClose={setClose}
        setError={setError}
        setUrlPlayer={setUrlPlayer}
        setClosePlayer={setClosePlayer}
      />

      <SeriesDataSeasons
        seriesData={seriesData}
        setSeasonNum={setSeasonNum}
        setSeriesData={setSeriesData}
      />

      <SeriesDataInfoDetails seriesData={seriesData} />

      {close ? (
        <div className="series_episodes_con" onClick={clickOutsideEpisods}>
          <SeriesEpisodes episodes={seasons_count[seasonNum - 1] || ""} />
        </div>
      ) : null}
    </div>
  );
}
