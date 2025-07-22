import { useState, useEffect, useContext, useCallback, useRef } from "react";
import Hls from "hls.js";
import { Context } from "../../Util/createContext";

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
  const [localUrl, setLocalUrl] = useState(url); // Local URL state
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
            minHeight: 200,
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline // Prevent fullscreen on iOS
            webkitplaysinline="true"
            width="100%"
            height="100%"
            style={{
              width: "100%",
              height: "100%",
              background: "#000",
            }}
            onClick={(e) => {
              e.stopPropagation();

              // Toggle fullscreen
              if (document.fullscreenElement) {
                document.exitFullscreen();
              } else {
                fullScreen(); // Call parent's fullscreen function
              }
            }}
            onLoadedData={() => {
              setErr(null);
              setLoading(true);
              setVideoLoading(false);
              setRetryCount(0);
              if (playerContainerRef.current && videoRef.current) {
                playerContainerRef.current.style.height = `${videoRef.current.clientHeight}px`;
              }
            }}
            onWaiting={() => setVideoLoading(true)}
            onPlaying={() => setVideoLoading(false)}
            onPause={() => setVideoLoading(false)}
            onEnded={() => setVideoLoading(false)}
            onError={handlePlayerError}
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  fullScreen();
                }
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