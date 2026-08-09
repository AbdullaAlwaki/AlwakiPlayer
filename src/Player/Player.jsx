import React, { useContext, useRef, useState, useEffect } from "react";
import Hls from "hls.js";
import { useNavigate } from "react-router-dom";
import { Context } from "../Util/createContext";
import "./Player.scss";

const Player = () => {
  const [streamUrl, setStreamUrl] = useState("");
  const [skipOverlay, setSkipOverlay] = useState(""); // "+15s" or "-15s"
  const { urlPlayer, serverUrl, username, password, setUrlPlayer } = useContext(Context);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const lastSavedTimeRef = useRef(0);
  const skipTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // Restore last watched time when metadata is ready
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !urlPlayer) return;

    const id = urlPlayer.episodes
      ? urlPlayer.episodes[urlPlayer.idx]?.id
      : urlPlayer.data?.movie_data?.stream_id;

    if (!id) return;

    const restoreSavedTime = () => {
      try {
        let times = JSON.parse(localStorage.getItem("TimeOfVOD") || "[]");
        if (!Array.isArray(times)) times = [];

        const saved = times.find((item) => item.id === id);
        if (!saved || !Number.isFinite(saved.currentTime)) return;

        const safeTime = Math.max(0, Math.min(saved.currentTime, video.duration || saved.currentTime));
        if (Number.isFinite(video.duration)) {
          video.currentTime = safeTime;
        }
      } catch (err) {
        console.warn("Failed to restore video time:", err);
      }
    };

    if (video.readyState >= 1) {
      restoreSavedTime();
      return;
    }

    video.addEventListener("loadedmetadata", restoreSavedTime);
    return () => video.removeEventListener("loadedmetadata", restoreSavedTime);
  }, [streamUrl, urlPlayer]);

  // Generate stream URL
  useEffect(() => {
    let id, ext, whatIs;

    if (!urlPlayer) return;

    if (urlPlayer.episodes) {
      whatIs = "series";
      id = urlPlayer.episodes[urlPlayer.idx]?.id;
      ext = urlPlayer.episodes[urlPlayer.idx]?.container_extension;
    } else if (urlPlayer.data) {
      whatIs = "movie";
      id = urlPlayer.data.movie_data?.stream_id;
      ext = urlPlayer.data.movie_data?.container_extension;
    }

    if (!id || !ext || !whatIs) return;

    setStreamUrl(`${serverUrl}/${whatIs}/${username}/${password}/${id}.${ext}`);
  }, [serverUrl, username, password, urlPlayer]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (streamUrl.endsWith(".m3u8") && Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 300,
        maxMaxBufferLength: 300,
        backBufferLength: 30,
        liveSyncDurationCount: 3,
        lowLatencyMode: false,
        enableWorker: true,
      });

      hlsRef.current = hls;
      hls.attachMedia(video);
      hls.loadSource(streamUrl);

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    video.src = streamUrl;
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl]);

  // Save current time & handle keyboard skip
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !urlPlayer) return;

    const id = urlPlayer.episodes
      ? urlPlayer.episodes[urlPlayer.idx]?.id
      : urlPlayer.data?.movie_data?.stream_id;

    if (!id) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      if (!Number.isFinite(currentTime)) return;
      if (Math.abs(currentTime - lastSavedTimeRef.current) < 1) return;

      lastSavedTimeRef.current = currentTime;

      try {
        let times = JSON.parse(localStorage.getItem("TimeOfVOD") || "[]");
        if (!Array.isArray(times)) times = [];

        const index = times.findIndex((item) => item.id === id);
        if (index !== -1) {
          times[index].currentTime = currentTime;
        } else {
          times.push({ id, currentTime });
        }

        localStorage.setItem("TimeOfVOD", JSON.stringify(times));
      } catch (err) {
        console.warn("Failed to save video time:", err);
      }
    };

    const handleEnded = () => {
      if (urlPlayer.episodes && urlPlayer.idx < urlPlayer.episodes.length - 1) {
        setUrlPlayer({ ...urlPlayer, idx: urlPlayer.idx + 1 });
      }
    };

    const showSkipOverlay = (text) => {
      setSkipOverlay(text);
      if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
      skipTimeoutRef.current = setTimeout(() => setSkipOverlay(""), 600);
    };

    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        video.currentTime = Math.min(video.duration, video.currentTime + 15);
        showSkipOverlay("+15s");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        video.currentTime = Math.max(0, video.currentTime - 15);
        showSkipOverlay("-15s");
      } else if (e.key === "Escape" || e.key === "Backspace") {
        e.preventDefault();
        navigate(-1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        video.paused ? video.play() : video.pause();
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      window.removeEventListener("keydown", handleKeyDown);
      if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
    };
  }, [urlPlayer, setUrlPlayer, navigate]);

  return (
    <div className="player-container" role="application" aria-label="Video player">
      <div className="player">
        <video
          ref={videoRef}
          playsInline
          preload="metadata"
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
};

export default Player;
