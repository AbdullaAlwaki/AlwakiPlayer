import React, { useContext, useEffect, useRef, useState, useCallback } from "react";
import { Context } from "../Util/createContext";
import "./Player.scss";

const Player = () => {
  const { setLoading, setError, urlPlayer } = useContext(Context);

  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState("");
  const [err, setErr] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isAirPlayAvailable, setIsAirPlayAvailable] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [seeking, setSeeking] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [doubleClickSide, setDoubleClickSide] = useState(null);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastClickX, setLastClickX] = useState(0);
  const [showLeftSeek, setShowLeftSeek] = useState(false);
  const [showRightSeek, setShowRightSeek] = useState(false);
  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const progressRef = useRef(null);
  const touchStartPositionRef = useRef({ x: 0, y: 0 });
  const doubleClickTimeoutRef = useRef(null);

  // Check if AirPlay is available
  useEffect(() => {
    if (window.WebKitPlaybackTargetAvailabilityEvent) {
      const video = videoRef.current;
      if (video) {
        video.addEventListener("webkitplaybacktargetavailabilitychanged", (event) => {
          setIsAirPlayAvailable(event.availability === "available");
        });
      }
    }
  }, []);

  const handleAirPlay = useCallback(() => {
    const video = videoRef.current;
    if (video && video.webkitShowPlaybackTargetPicker) {
      video.webkitShowPlaybackTargetPicker();
    }
  }, []);

  // Detect if the URL is a YouTube link
  const isYouTubeUrl = useCallback(
    (url) => {
      return (
        url &&
        (/youtube\.com\/watch\?v=/.test(url) ||
          /youtu\.be\/[a-zA-Z0-9_-]+/.test(url))
      );
    },
    []
  );

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        setErr(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleKeyDown = useCallback(
    (event) => {
      const video = videoRef.current;
      if (!video) return;

      switch (event.key.toLowerCase()) {
        case "f":
          event.preventDefault();
          handleFullscreen();
          break;
        case " ":
        case "k":
          event.preventDefault();
          video.paused ? video.play() : video.pause();
          break;
        case "arrowleft":
          event.preventDefault();
          video.currentTime = Math.max(video.currentTime - 10, 0);
          break;
        case "arrowright":
          event.preventDefault();
          video.currentTime = Math.min(video.currentTime + 10, video.duration);
          break;
        case "arrowup":
          event.preventDefault();
          setVolume((prev) => Math.min(prev + 0.1, 1));
          video.volume = Math.min(video.volume + 0.1, 1);
          break;
        case "arrowdown":
          event.preventDefault();
          setVolume((prev) => Math.max(prev - 0.1, 0));
          video.volume = Math.max(video.volume - 0.1, 0);
          break;
        case "m":
          event.preventDefault();
          setIsMuted((prev) => !prev);
          video.muted = !video.muted;
          break;
        case "a":
          event.preventDefault();
          if (isAirPlayAvailable) {
            handleAirPlay();
          }
          break;
        default:
          break;
      }
    },
    [handleFullscreen, isAirPlayAvailable, handleAirPlay]
  );
  // Format time in HH:MM:SS
  const formatTime = useCallback((time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlaying(true);
          })
          .catch(err => {
            if (err.name !== 'AbortError') {
              console.log('Error playing:', err);
            }
            setPlaying(false);
          });
      } else {
        setPlaying(true);
      }
    } else {
      video.pause();
      setPlaying(false);
    }
  }, []);

  const handleSeek = useCallback((e) => {
    const video = videoRef.current;
    const progress = progressRef.current;
    if (!video || !progress) return;

    const rect = progress.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    video.currentTime = pos * video.duration;
  }, []);

  const startSeeking = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setSeeking(true);
    setPlaying(false);
    videoRef.current?.pause();
    handleSeek(e);
  }, [handleSeek]);

  const handleSeeking = useCallback((e) => {
    if (seeking) {
      e.preventDefault();
      e.stopPropagation();
      handleSeek(e);
    }
  }, [seeking, handleSeek]);

  const endSeeking = useCallback((e) => {
    if (seeking) {
      e.preventDefault();
      e.stopPropagation();
      setSeeking(false);
      handleSeek(e);
      if (playing) {
        videoRef.current?.play();
        setPlaying(true);
      }
    }
  }, [seeking, handleSeek, playing]);

  const handleVolumeChange = useCallback((e) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const handleControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  // Handle player initialization
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleCanPlay = () => {
        setIsPlayerReady(true);
        setLoading(false);
      };

      const handleWaiting = () => {
        setLoading(true);
      };

      video.addEventListener('loadedmetadata', handleCanPlay);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('waiting', handleWaiting);

      return () => {
        video.removeEventListener('loadedmetadata', handleCanPlay);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('waiting', handleWaiting);
      };
    }
  }, [setLoading, setIsPlayerReady]);

  // Handle URL changes
  useEffect(() => {
    let mounted = true;
    if (urlPlayer) {
      setLoading(true);
      setIsPlayerReady(false);
      if (!isYouTubeUrl(urlPlayer)) {
        const segments = urlPlayer.split("/");
        const episodeSegment = segments.length > 6 ? segments[6] : "";
        const currentEpisode = episodeSegment.split(".")[0];
        if (mounted) {
          setCurrentEpisodeIndex(currentEpisode);
        }
      } else if (mounted) {
        setCurrentEpisodeIndex("");
      }
    }
    return () => {
      mounted = false;
    };
  }, [urlPlayer, isYouTubeUrl, setLoading]);

  useEffect(() => {
    const video = videoRef.current;
    if (!isYouTubeUrl(urlPlayer) && video) {
      // Don't set source until player is mounted
      if (!video.src && urlPlayer) {
        video.src = urlPlayer;
      }

      // Restore last playback position when player is ready
      const savedPlayedSeconds = localStorage.getItem(`${currentEpisodeIndex}`);
      if (savedPlayedSeconds && isPlayerReady) {
        video.currentTime = parseFloat(savedPlayedSeconds);
      }

      // Restore volume settings
      video.volume = volume;
      video.muted = isMuted;

      const handleTimeUpdate = () => {
        if (video) {
          localStorage.setItem(
            `${currentEpisodeIndex}`,
            video.currentTime.toString()
          );
        }
      };

      const handleError = (error) => {
        console.error('Video Error:', error);
        setErr(`Error playing video: ${error.message || "Stream unavailable"}`);
        setLoading(false);
        setError("Video playback error");
      };

      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("error", handleError);
      video.addEventListener("loadstart", () => setLoading(true));
      video.addEventListener("canplay", () => setLoading(false));
      video.addEventListener("playing", () => setLoading(false));
      video.addEventListener("ended", () => {
        setLoading(false);
        localStorage.removeItem(`${currentEpisodeIndex}`);
      });
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("error", handleError);
        video.removeEventListener("loadstart", () => setLoading(true));
        video.removeEventListener("canplay", () => setLoading(false));
        video.removeEventListener("playing", () => setLoading(false));
        video.removeEventListener("ended", () => {
          setLoading(false);
          localStorage.removeItem(`${currentEpisodeIndex}`);
        });
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [
    urlPlayer,
    currentEpisodeIndex,
    setLoading,
    setError,
    handleKeyDown,
    isYouTubeUrl,
    volume,
    isMuted,
    isPlayerReady
  ]);

  // Update currentTime
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  // Handle touch events for mobile
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStartPositionRef.current = { x: touch.clientX, y: touch.clientY };
    setTouchStartTime(Date.now());
  }, []);
  const handleTouchEnd = useCallback((e) => {
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime;
    const timeSinceLastTap = touchEndTime - lastTapTime;
    const touch = e.changedTouches[0];
    const screenWidth = window.innerWidth;
    const touchX = touch.clientX;
    const touchPosition = touchX / screenWidth;

    // Clear any existing timeout
    if (doubleClickTimeoutRef.current) {
      clearTimeout(doubleClickTimeoutRef.current);
      doubleClickTimeoutRef.current = null;
    }

    // Detect double tap
    if (timeSinceLastTap < 300) {
      e.preventDefault();
      const video = videoRef.current;
      const wasPlaying = !video.paused;

      if (touchPosition < 0.4) {
        // Double tap on left side - rewind 10s
        video.currentTime = Math.max(0, video.currentTime - 10);
        setShowLeftSeek(true);
        setTimeout(() => setShowLeftSeek(false), 500);
        setDoubleClickSide('left');
        setTimeout(() => setDoubleClickSide(null), 500);
      } else if (touchPosition > 0.6) {
        // Double tap on right side - forward 10s
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
        setShowRightSeek(true);
        setTimeout(() => setShowRightSeek(false), 500);
        setDoubleClickSide('right');
        setTimeout(() => setDoubleClickSide(null), 500);
      }

      // Keep playing state
      if (wasPlaying) {
        video.play().catch(err => console.log('Error playing:', err));
      }
      setLastTapTime(0);
    } else {
      // Wait to see if this is a double tap
      doubleClickTimeoutRef.current = setTimeout(() => {
        // Only toggle play if it wasn't a double tap
        if (touchDuration < 250) {
          togglePlay();
        }
        doubleClickTimeoutRef.current = null;
      }, 300);
      setLastTapTime(touchEndTime);
    }

    // Always show controls on tap
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, [touchStartTime, lastTapTime, togglePlay]);

  const handleTouchMove = useCallback((e) => {
    if (!videoRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartPositionRef.current.x;
    const deltaY = touch.clientY - touchStartPositionRef.current.y;

    // If horizontal movement is greater than vertical, prevent scrolling
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
    }
  }, []);

  // Add touch event listeners
  useEffect(() => {
    const player = containerRef.current;
    if (player) {
      player.addEventListener('touchstart', handleTouchStart, { passive: true });
      player.addEventListener('touchend', handleTouchEnd, { passive: true });
      player.addEventListener('touchmove', handleTouchMove, { passive: false });

      return () => {
        player.removeEventListener('touchstart', handleTouchStart);
        player.removeEventListener('touchend', handleTouchEnd);
        player.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [handleTouchStart, handleTouchEnd, handleTouchMove]);  const handleVideoClick = useCallback((e) => {
    const currentTime = Date.now();
    const timeSinceLastClick = currentTime - lastClickTime;
    const clickX = e.clientX;
    
    // Clear any existing single-click timeout
    if (doubleClickTimeoutRef.current) {
      clearTimeout(doubleClickTimeoutRef.current);
      doubleClickTimeoutRef.current = null;
    }
    
    if (timeSinceLastClick < 300) {
      e.preventDefault();
      e.stopPropagation();
      
      // Double click detected
      const screenWidth = window.innerWidth;
      const clickPosition = clickX / screenWidth;
      const video = videoRef.current;      const wasPlaying = !video.paused;

      // Ensure we pause first before seeking
      if (wasPlaying) {
        video.pause();
      }

      // Wait a short moment before seeking
      setTimeout(() => {
        if (clickPosition < 0.4) {
          // Double click on left side - rewind 10s
          video.currentTime = Math.max(0, video.currentTime - 10);
          setShowLeftSeek(true);
          setTimeout(() => setShowLeftSeek(false), 500);
          setDoubleClickSide('left');
          setTimeout(() => setDoubleClickSide(null), 500);
        } else if (clickPosition > 0.6) {
          // Double click on right side - forward 10s
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          setShowRightSeek(true);
          setTimeout(() => setShowRightSeek(false), 500);
          setDoubleClickSide('right');
          setTimeout(() => setDoubleClickSide(null), 500);
        }

        // Resume playback after seeking if it was playing
        if (wasPlaying) {
          setTimeout(() => {
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(err => {
                if (err.name !== 'AbortError') {
                  console.log('Error playing:', err);
                }
              });
            }
          }, 50);
        }
      }, 50);
    } else {
      // Wait to see if this is a double click
      doubleClickTimeoutRef.current = setTimeout(() => {
        // Only toggle play if it wasn't a double click
        togglePlay();
        doubleClickTimeoutRef.current = null;
      }, 300);
    }

    setLastClickTime(currentTime);
    setLastClickX(clickX);
  }, [lastClickTime, togglePlay]);

  // Clean up double click timeout on unmount
  useEffect(() => {
    return () => {
      if (doubleClickTimeoutRef.current) {
        clearTimeout(doubleClickTimeoutRef.current);
      }
    };
  }, []);

  // Add progress bar touch event listeners
  useEffect(() => {
    const progressBar = progressRef.current;
    if (progressBar) {
      progressBar.addEventListener('touchstart', startSeeking, { passive: false });
      progressBar.addEventListener('touchmove', handleSeeking, { passive: false });
      progressBar.addEventListener('touchend', endSeeking, { passive: false });
      progressBar.addEventListener('mousedown', startSeeking);
      document.addEventListener('mousemove', handleSeeking);
      document.addEventListener('mouseup', endSeeking);

      return () => {
        progressBar.removeEventListener('touchstart', startSeeking);
        progressBar.removeEventListener('touchmove', handleSeeking);
        progressBar.removeEventListener('touchend', endSeeking);
        progressBar.removeEventListener('mousedown', startSeeking);
        document.removeEventListener('mousemove', handleSeeking);
        document.removeEventListener('mouseup', endSeeking);
      };
    }
  }, [startSeeking, handleSeeking, endSeeking]);

  // Add error boundary effect
  useEffect(() => {
    if (err) {
      const timer = setTimeout(() => {
        setErr(null);
      }, 5000); // Auto-dismiss error after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [err]);

  // Replace existing controls div with improved accessibility
  return (
    <div 
      className="player-container" 
      ref={containerRef}
      onMouseMove={handleControlsTimeout}
      onMouseLeave={() => setShowControls(false)}
      role="application"
      aria-label="Video player"
    >
      <div className="player">
        {err ? (
          <div className="error-message" role="alert" aria-live="assertive">
            <p>{err}</p>
            <button
              onClick={() => {
                setErr(null);
                if (videoRef.current) {
                  videoRef.current.load();
                }
              }}
              aria-label="Dismiss error and try again"
              className="try-again-button"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="player_overlay" ref={iframeRef}>
            {isYouTubeUrl(urlPlayer) ? (
              <div
                className="youtube-container"
                role="region"
                aria-label="YouTube video player"
              >
                <iframe
                  src={`https://www.youtube.com/embed/${
                    new URL(urlPlayer).searchParams.get("v") ||
                    urlPlayer.split("/").pop()
                  }?autoplay=1&enablejsapi=1`}
                  frameBorder="0"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  title="YouTube video"
                  aria-label="YouTube video player"
                />
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="video-player"
                  autoPlay
                  preload="metadata"
                  src={urlPlayer}
                  aria-label={`Video player - ${playing ? 'Playing' : 'Paused'}`}
                  playsInline
                  onClick={handleVideoClick}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <track kind="captions" src="" label="English captions" />
                  Your browser does not support the video tag.
                </video>

                {doubleClickSide && (
                  <div 
                    className={`double-click-indicator ${doubleClickSide}`}
                    role="status"
                    aria-live="polite"
                  >
                    <div className="indicator-content">
                      <svg 
                        viewBox="0 0 24 24" 
                        width="48" 
                        height="48"
                        aria-hidden="true"
                      >
                        <path fill="currentColor" d={
                          doubleClickSide === 'left' 
                            ? "M11.5 12l8.5-6v12l-8.5-6zm-2 0l8.5-6v12l-8.5-6z" 
                            : "M4 18l8.5-6L4 6v12zm11 0l8.5-6L15 6v12z"
                        }/>
                      </svg>
                      <span>{doubleClickSide === 'left' ? 'Rewind 10 seconds' : 'Forward 10 seconds'}</span>
                    </div>
                  </div>
                )}

                {showControls && (
                  <div 
                    className="custom-controls"
                    role="group"
                    aria-label="Video controls"
                  >
                    <div 
                      className="progress-container"
                      ref={progressRef}
                      role="slider"
                      aria-label="Video progress"
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-valuenow={(currentTime / (videoRef.current?.duration || 1)) * 100}
                      aria-valuetext={`${formatTime(currentTime)} of ${formatTime(videoRef.current?.duration || 0)}`}
                      tabIndex="0"
                    >
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${(currentTime / (videoRef.current?.duration || 1)) * 100}%` }}
                        />
                      </div>
                      <div className="time-display" aria-hidden="true">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(videoRef.current?.duration || 0)}</span>
                      </div>
                    </div>

                    <div className="controls-main">
                      <div className="controls-left">
                        <button 
                          onClick={togglePlay}
                          className="control-button"
                          aria-label={playing ? "Pause" : "Play"}
                        >
                          {/* SVG icons remain the same but add aria-hidden="true" */}
                          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                            <path fill="currentColor" d={playing 
                              ? "M6 19h4V5H6v14zm8-14v14h4V5h-4z"
                              : "M8 5v14l11-7z"
                            }/>
                          </svg>
                        </button>

                        <div 
                          className="volume-control"
                          role="group"
                          aria-label="Volume controls"
                        >
                          <button 
                            onClick={() => setIsMuted(!isMuted)}
                            className="control-button"
                            aria-label={isMuted ? "Unmute" : "Mute"}
                          >
                            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                              <path fill="currentColor" d={isMuted
                                ? "M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
                                : "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                              }/>
                            </svg>
                          </button>
                          <input 
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="volume-slider"
                            aria-label="Volume"
                          />
                        </div>
                      </div>

                      <div className="controls-right">
                        {isAirPlayAvailable && (
                          <button
                            onClick={handleAirPlay}
                            className="control-button"
                            aria-label="Stream to AirPlay device"
                          >
                            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                              <path fill="currentColor" d="M6 22h12a2 2 0 002-2V4a2 2 0 00-2-2H6a2 2 0 00-2 2v16a2 2 0 002 2zm6-11l6 7H6l6-7z"/>
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={handleFullscreen}
                          className="control-button"
                          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                        >
                          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                            <path fill="currentColor" d={isFullscreen
                              ? "M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
                              : "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
                            }/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            {!isPlayerReady && !err && !isYouTubeUrl(urlPlayer) && (
              <div 
                className="loading-overlay"
                role="alert"
                aria-live="polite"
              >
                <div className="loading-spinner" aria-hidden="true"></div>
                <p>Loading stream...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Seek indicators */}
      <div 
        className={`seek-indicator left ${showLeftSeek ? 'visible' : ''}`}
        role="status"
        aria-live="polite"
        aria-hidden={!showLeftSeek}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11.5,12l8.5,6V6L11.5,12z M2,18l8.5-6L2,6V18z"/>
        </svg>
      </div>

      <div 
        className={`seek-indicator right ${showRightSeek ? 'visible' : ''}`}
        role="status"
        aria-live="polite"
        aria-hidden={!showRightSeek}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4,18l8.5-6L4,6V18z M13,6v12l8.5-6L13,6z"/>
        </svg>
      </div>
    </div>
  );
};

export default Player;
