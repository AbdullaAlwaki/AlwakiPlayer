import { useState, useEffect, useContext, useCallback, useRef } from "react";
import Hls from "hls.js";
import { Context } from "../../Util/createContext";
import PlayerController from "./PlayerController";
import { useState as useLocalState, useRef as useLocalRef } from "react";

function LivePlayer({
  url,
  retryCount,
  setRetryCount,
  isFocused,
  fullScreen,
  playerContainerRef,
}) {
  const [err, setErr] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [muted, setMuted] = useState(true);
  const [localUrl, setLocalUrl] = useState(url); // Local URL state
  // Controller visibility state
  const [showController, setShowController] = useLocalState(false);
  const controllerTimeout = useLocalRef(null);
  // Always show on mobile/touch devices
  const isTouch = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  const showPlayerController = () => {
    setShowController(true);
    if (controllerTimeout.current) clearTimeout(controllerTimeout.current);
    controllerTimeout.current = setTimeout(() => setShowController(false), 5000);
  };
  const { setLoading } = useContext(Context);

  const maxRetries = 3;
  const retryDelay = 2000; // ms

  const videoRef = useRef(null);
  const hlsInstance = useRef(null);

  // Sync localUrl with prop changes
  useEffect(() => {
    setLocalUrl(url);
  }, [url]);

  const handlePlayerError = useCallback(
    (error) => {
      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount((c) => c + 1);
          setErr(null);
          setVideoLoading(false);
          setLocalUrl(null);
        }, retryDelay);
      } else {
        setErr("Error loading video. Please try again later.");
        setLoading(false);
        setVideoLoading(false);
      }
    },
    [retryCount, url, setLoading, setRetryCount, retryDelay]
  );

  // Handle loading spinner
  useEffect(() => {
    let loadingTimeout = null;

    if (videoLoading) {
      loadingTimeout = setTimeout(() => {
        setVideoLoading(true);
      }, 1000);
    }

    return () => clearTimeout(loadingTimeout);
  }, [videoLoading]);

  // Initialize video or HLS.js
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !localUrl) return;

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // Use HLS.js for .m3u8 on non-iOS
    if (typeof localUrl === "string" && localUrl.endsWith(".m3u8") && !isIOS) {
      if (Hls.isSupported()) {
        if (hlsInstance.current) {
          hlsInstance.current.destroy();
        }
        const hls = new Hls();
        hls.attachMedia(video);
        hls.loadSource(localUrl);
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) handlePlayerError(data);
        });
        hlsInstance.current = hls;
      } else {
        video.src = localUrl;
      }
    } else {
      // Fallback for iOS or non-HLS
      video.src = localUrl;
    }

    return () => {
      if (hlsInstance.current) {
        hlsInstance.current.destroy();
        hlsInstance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localUrl, handlePlayerError]);

  return (
    <>
      {err ? (
        <div
          className={`iptv-player ${isFocused === 3 ? "selected" : ""}`}
          style={{
            height:
              videoRef.current && videoRef.current.videoHeight
                ? `${videoRef.current.clientHeight}px`
                : "auto",
            minHeight: 200,
          }}
        >
          <div style={{ width: "100%", textAlign: "center" }}>
            <p>{err}</p>
            {retryCount < maxRetries && (
              <button
                className="retry-btn"
                onClick={() => {
                  setRetryCount(0);
                  setErr(null);
                  setLocalUrl(null);
                  setTimeout(() => setLocalUrl(url), 100);
                }}
              >
                Retry
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`iptv-player ${isFocused === 3 ? "selected" : ""}`}
          tabIndex="0"
          aria-label="IPTV Player"
          ref={playerContainerRef}
          style={{
            height:
              videoRef.current && videoRef.current.videoHeight
                ? `${videoRef.current.clientHeight}px`
                : "auto",
            position: "relative"
          }}
          onMouseMove={!isTouch ? showPlayerController : undefined}
          onMouseEnter={!isTouch ? showPlayerController : undefined}
          onMouseLeave={!isTouch ? () => setShowController(false) : undefined}
          onTouchStart={isTouch ? showPlayerController : undefined}
        >
          {(showController || isTouch) && (
            <PlayerController
              muted={muted}
              onToggleMute={() => {
                setMuted(m => {
                  if (videoRef.current) videoRef.current.muted = !m;
                  return !m;
                });
                showPlayerController(); // reset timer on click
              }}
            />
          )}
          <video
            ref={videoRef}
            autoPlay
            muted={muted}
            playsInline // Prevent fullscreen on iOS
            webkitplaysinline="true"
            width="100%"
            style={{ width: "100%", height: "auto", maxHeight: "100vh", background: "#000" }}
            onLoadedData={() => {
              setErr && setErr(null);
              setLoading && setLoading(true);
              setVideoLoading && setVideoLoading(false);
              setRetryCount && setRetryCount(0);
              // Force update to sync container height
              if (playerContainerRef.current)
                playerContainerRef.current.style.height = videoRef.current
                  ? `${videoRef.current.clientHeight}px`
                  : "auto";
            }}
            onWaiting={() => setVideoLoading && setVideoLoading(true)}
            onPlaying={() => setVideoLoading && setVideoLoading(false)}
            onPause={() => setVideoLoading && setVideoLoading(false)}
            onEnded={() => setVideoLoading && setVideoLoading(false)}
            onError={handlePlayerError}
            onClick={e => {
              // Only trigger fullscreen if not clicking a control (like mute)
              if (!document.fullscreenElement && playerContainerRef.current) {
                playerContainerRef.current.requestFullscreen();
              } else {
                document.exitFullscreen();
              }
              e.stopPropagation();
            }}
            tabIndex={0}
            onKeyDown={event => {
              if (event.key === "Enter") {
                event.preventDefault();
                fullScreen();
              }
            }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </>
  );
}

export default LivePlayer;