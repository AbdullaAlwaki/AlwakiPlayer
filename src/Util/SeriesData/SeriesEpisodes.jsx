import React, { useEffect, useState, useContext, useRef } from "react";
import { Context } from "../createContext";
import { useNavigate } from "react-router-dom";
import "./SeriesData.scss";

export default function SeriesEpisodes({
  episodes,
  focusIndex,
  setFocusIndex,
  isFocused,
}) {
  const [episodesdata, setepisodesdata] = useState([]);
  const { setError, setUrlPlayer } = useContext(Context);
  const navigate = useNavigate();

  // refs لكل العناصر حتى نقدر نعمل scroll إليها
  const itemsRef = useRef([]);

  useEffect(() => {
    setepisodesdata(Object.values(episodes));
  }, [episodes]);

  const handleSeriesClick = (seriesId, idx) => {
    setError("");
    setUrlPlayer({ idx: idx, episodes: episodes });
    navigate("/Player");
  };

  const episodesTimes = JSON.parse(localStorage.getItem("TimeOfVOD")) || [];

  // ⬅➡ التحكم بالأسهم
  useEffect(() => {
    if (isFocused !== 3) return; // فقط إذا كان الفوكس على قسم الحلقات

    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        setFocusIndex((prev) =>
          prev < episodesdata.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        setFocusIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter") {
        handleSeriesClick(episodesdata[focusIndex].id, focusIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocused, focusIndex, episodesdata]);

  // ✅ اجعل العنصر المحدد يظهر داخل الشاشة تلقائياً
  useEffect(() => {
    if (isFocused === 3 && itemsRef.current[focusIndex]) {
      itemsRef.current[focusIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [focusIndex, isFocused]);

  return (
    <div className="series_episodes">
      {episodesdata.map((episode, idx) => (
        <div
          key={episode.id}
          ref={(el) => (itemsRef.current[idx] = el)}
          className={` ${
            isFocused === 3 && focusIndex === idx ? "episods-focused" : ""
          }`}
          onClick={() => handleSeriesClick(episode.id, idx)}
        >
          <div className="episodes_data">
            <div>
              <h2>Episode</h2>
              {episode.episode_num}
            </div>
            <div>
              <h2>Title</h2>
              {episode.title}
            </div>
            <div>
              <h2>Duration</h2>
              {episode?.info?.duration}
            </div>
            <div>
              <h2>Season</h2>
              {episode.season}
            </div>
            <div>
              <h2>Added</h2>
              {new Date(episode.added * 1000).toDateString()}
            </div>
          </div>
          {/* Progress Bar */}

          <div className="progress-container">
            {(() => {
              const played = episodesTimes.find(
                (item) => item.id === episode.id
              );
              const currentTime =
                played && !isNaN(played.currentTime) ? played.currentTime : 0;

              let durationSeconds = 1; // default to avoid division by zero

              if (episode?.info?.duration) {
                const parts = episode.info.duration.split(":").map(Number); // [HH, MM, SS]
                if (parts.length === 3) {
                  durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
                } else if (parts.length === 2) {
                  durationSeconds = parts[0] * 60 + parts[1];
                } else if (parts.length === 1) {
                  durationSeconds = parts[0];
                }
              }

              const progress = Math.min(
                (currentTime / durationSeconds) * 100,
                100
              );

              return (
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${progress}%` }} />
                </div>
              );
            })()}
          </div>
        </div>
      ))}
    </div>
  );
}
