import React, { useContext, useEffect, useRef, useState } from "react";
import { Context } from "./createContext";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "../Style/Player.scss";
import YouTube from 'react-youtube';

const Player = () => {
  const {
    setLoading,
    setError,
    urlPlayer,
    setClosePlayer,
    closePlayer,
  } = useContext(Context);

  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState('');
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const videoJsPlayer = useRef(null);

  // Detect if the URL is a YouTube link
  const isYouTubeUrl = (url) => {
    return /youtube\.com\/watch\?v=/.test(url) || /youtu\.be\/[a-zA-Z0-9_-]+/.test(url);
  };

  useEffect(() => {
    if (urlPlayer) {
      if (!isYouTubeUrl(urlPlayer)) {
        const segments = urlPlayer.split("/");
        const episodeSegment = segments.length > 6 ? segments[6] : '';
        const currentEpisode = episodeSegment.split(".")[0];
        setCurrentEpisodeIndex(currentEpisode);
      } else {
        setCurrentEpisodeIndex('');
      }
    }
  }, [urlPlayer]);

  useEffect(() => {
    if (closePlayer && !isYouTubeUrl(urlPlayer) && videoRef.current) {
      if (!videoJsPlayer.current) {
        videoJsPlayer.current = videojs(videoRef.current, {
          controls: true,
          autoplay: true,
          preload: 'auto',
          sources: [{ src: urlPlayer, type: 'video/mp4' }],
        });

        videoJsPlayer.current.on('timeupdate', () => {
          const currentTime = videoJsPlayer.current.currentTime();
          localStorage.setItem(`${currentEpisodeIndex}`, currentTime.toString());
        });

        videoJsPlayer.current.on('play', () => setLoading(false));
        videoJsPlayer.current.on('pause', () => setLoading(false));
        videoJsPlayer.current.on('ended', () => setLoading(false));
        videoJsPlayer.current.on('error', (error) => {
          setError(`Error loading video: ${error}`);
          setLoading(false);
        });
      }

      const savedPlayedSeconds = localStorage.getItem(`${currentEpisodeIndex}`);
      if (savedPlayedSeconds) {
        videoJsPlayer.current.currentTime(parseFloat(savedPlayedSeconds));
      }
    }

    return () => {
      if (videoJsPlayer.current) {
        videoJsPlayer.current.dispose();
        videoJsPlayer.current = null;
      }
    };
  }, [closePlayer, urlPlayer, currentEpisodeIndex, setLoading, setError]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (playerRef.current && !playerRef.current.contains(event.target)) {
        setClosePlayer(false);
      }
    };

    if (closePlayer) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closePlayer, setClosePlayer]);

  return (
    <>
      {closePlayer && (
        <div className="player-container">
          <div className="player">
            <div className="player_overlay" ref={playerRef}>
              {isYouTubeUrl(urlPlayer) ? (
                <div data-vjs-player className="youtube-container">
                  <YouTube
                    videoId={new URL(urlPlayer).searchParams.get('v') || urlPlayer.split('/').pop()}
                    opts={{
                      height: '100%',
                      width: '100%',
                      playerVars: {
                        autoplay: 1,
                      },
                    }}
                    className="youtube"
                  />
                </div>
              ) : (
                <div data-vjs-player>
                  <video
                    ref={videoRef}
                    className="video-js vjs-default-skin"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Player;
