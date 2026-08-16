import React, { useContext, useRef, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../Util/createContext";
import "./Player.scss";

const Player = React.memo(() => {
  const [streamUrl, setStreamUrl] = useState("");
  const [skipOverlay, setSkipOverlay] = useState(""); // "+15s" or "-15s"
  const { urlPlayer, serverUrl, username, password, setUrlPlayer } = useContext(Context);
  const videoRef = useRef(null);
  const navigate = useNavigate();
  
  // Memoize stream ID calculation to avoid recalculation on every render
  const streamId = useMemo(() => {
    return urlPlayer?.episodes
      ? urlPlayer.episodes[urlPlayer.idx]?.id
      : urlPlayer?.data?.movie_data?.stream_id;
  }, [urlPlayer]);

  // Restore last watched time
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamId) return;

    let times = JSON.parse(localStorage.getItem("TimeOfVOD") || "[]");
    if (!Array.isArray(times)) times = [];

    const saved = times.find((item) => item.id === streamId);
    if (saved) video.currentTime = saved.currentTime;
  }, [streamId]);

  // Generate stream URL
  useEffect(() => {
    if (!urlPlayer) return;
    
    let id, ext, whatIs;

    if (urlPlayer.episodes) {
      whatIs = "series";
      id = urlPlayer.episodes[urlPlayer.idx]?.id;
      ext = urlPlayer.episodes[urlPlayer.idx]?.container_extension;
    } else if (urlPlayer.data) {
      whatIs = "movie";
      id = urlPlayer.data.movie_data?.stream_id;
      ext = urlPlayer.data.movie_data?.container_extension;
    }

    if (id && ext) {
      setStreamUrl(`${serverUrl}/${whatIs}/${username}/${password}/${id}.${ext}`);
    }
  }, [serverUrl, username, password, urlPlayer]);

  // Save current time & handle keyboard skip
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamId) return;

    const handleTimeUpdate = () => {
      let times = JSON.parse(localStorage.getItem("TimeOfVOD") || "[]");
      if (!Array.isArray(times)) times = [];

      const index = times.findIndex((item) => item.id === streamId);
      if (index !== -1) {
        times[index].currentTime = video.currentTime;
      } else {
        times.push({ id: streamId, currentTime: video.currentTime });
      }

      localStorage.setItem("TimeOfVOD", JSON.stringify(times));
    };

    const handleEnded = () => {
      if (urlPlayer?.episodes && urlPlayer.idx < urlPlayer.episodes.length - 1) {
        setUrlPlayer({ ...urlPlayer, idx: urlPlayer.idx + 1 });
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        video.currentTime = Math.min(video.duration, video.currentTime + 15);
        showSkipOverlay("+15s");
      } else if (e.key === "ArrowLeft") {
        video.currentTime = Math.max(0, video.currentTime - 15);
        showSkipOverlay("-15s");
      } else if (e.key === "Escape" || e.key === "Backspace") {
        navigate(-1);
      } else if (e.key === "Enter") {
        video.paused ? video.play() : video.pause();
      }
    };

    const showSkipOverlay = (text) => {
      setSkipOverlay(text);
      setTimeout(() => setSkipOverlay(""), 600);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [streamId, urlPlayer, setUrlPlayer, navigate]);

  return (
    <div className="player-container" role="application" aria-label="Video player">
      <div className="player">
        <video
          ref={videoRef}
          playsInline
          controls
          src={streamUrl}
          autoPlay
          onContextMenu={(e) => e.preventDefault()}
          aria-label="Video player"
        >
          Your browser does not support the video tag.
        </video>
        {skipOverlay && <div className="skip-overlay">{skipOverlay}</div>}
      </div>
    </div>
  );
});

export default Player;
