import React, { useContext, useRef, useState, useEffect } from "react";
import { Context } from "../Util/createContext";
// import Hls from 'hls.js';
// import shaka from 'shaka-player';
import "./Player.scss";

// Utility function to check if URL is a YouTube URL
const isYouTubeUrl = (url) => {
  if (!url) return false;
  return url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i) !== null;
};

// Utility function to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url) => {
  if (!url) return '';
  
  // Extract video ID from various YouTube URL formats
  let videoId = '';
  
  // Handle youtu.be format
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1];
  } 
  // Handle youtube.com format
  else if (url.includes('youtube.com/watch?v=')) {
    videoId = new URL(url).searchParams.get('v');
  }
  
  // Remove any additional parameters
  videoId = videoId.split('&')[0];
  videoId = videoId.split('?')[0];
  
  // Add autoplay=1 and mute=1 parameters (mute is required for autoplay to work)
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
};

const Player = () => {
  const { setLoading, setError, urlPlayer } = useContext(Context);
  const [err, setErr] = useState(null);
  const [currentEpisodeIndex] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [isBuffering, setIsBuffering] = useState(true); // Track buffering/loading
  // const hlsInstance = useRef(null);
  // const shakaInstance = useRef(null);

  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  // Reset retry count when urlPlayer changes
  useEffect(() => {
    setRetryCount(0);
    setIsBuffering(true);
  }, [urlPlayer]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isYouTubeUrl(urlPlayer)) return;


    const handleTimeUpdate = () => {
      localStorage.setItem(`${currentEpisodeIndex}`, video.currentTime);
    };

    const handleLoadStart = () => {
      setIsBuffering(true);
      setLoading(true);
    };
    const handleCanPlay = () => {
      setIsBuffering(false);
      setLoading(false);
    };
    const handlePlaying = () => {
      setIsBuffering(false);
      setLoading(false);
    };
    const handleEnded = () => {
      setLoading(false);
      setIsBuffering(false);
      localStorage.removeItem(`${currentEpisodeIndex}`);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("ended", handleEnded);
    };
  }, [urlPlayer, currentEpisodeIndex, setError, setLoading, retryCount]);

  // Initialize players
  useEffect(() => {
    if (!videoRef.current || isYouTubeUrl(urlPlayer)) return;

    // Use only native video element for all streams
    const video = videoRef.current;
    video.src = urlPlayer;

    // Cleanup function (no-op)
    return () => {};
  }, [urlPlayer]);

  // Error handling effect
  useEffect(() => {
    if (err) {
      const timer = setTimeout(() => {
        setErr(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [err]);

  return (
    <div 
      className="player-container" 
      ref={containerRef}
      role="application"
      aria-label="Video player"
    >
      <div className="player">
        {isBuffering && !err && (
          <div className="modern-video-loading-overlay">
            <span className="modern-video-loading-spinner" />
            <span>Loading video...</span>
          </div>
        )}
        {err ? (
          <div className="error-message" role="alert" aria-live="assertive">
            <p style={{whiteSpace: 'pre-line'}}>{err}</p>
          </div>
        ) : isYouTubeUrl(urlPlayer) ? (
          <iframe
            ref={iframeRef}
            src={getYouTubeEmbedUrl(urlPlayer)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube video player"
            frameBorder="0"
          />
        ) : (
          <video
            ref={videoRef}
            playsInline
            controls
            autoPlay="autoplay"
            onContextMenu={(e) => e.preventDefault()}
            aria-label="Video player"
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
  );
};

export default Player;
