import { useState, useEffect, useRef, useContext, useCallback } from "react";
import Hls from "hls.js";
import { Context } from "../../Util/createContext";

function LivePlayer({ url, isFocused, playerContainerRef, categories }) {
  const videoRef = useRef(null);
  const hlsInstance = useRef(null);
  const overlayTimeout = useRef(null);

  const { serverUrl, username, password, setLoading } = useContext(Context);

  const [err, setErr] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(
    categories.findIndex((c) => c.stream_id === url.id) || 0
  );

  const currentChannel = categories[currentIndex] || url;

  const streamUrl = currentChannel
    ? `${serverUrl}/live/${username}/${password}/${currentChannel.stream_id}.${currentChannel.ext || "m3u8"}`
    : null;

  // Overlay عند تغيير القناة
  useEffect(() => {
    setShowOverlay(true);
    if (overlayTimeout.current) clearTimeout(overlayTimeout.current);
    overlayTimeout.current = setTimeout(() => setShowOverlay(false), 3000);
    setErr(null);
    return () => clearTimeout(overlayTimeout.current);
  }, [currentIndex, currentChannel]);

  // تبديل القنوات
  const nextChannel = useCallback(() => {
    setCurrentIndex((prev) => (prev < categories.length - 1 ? prev + 1 : prev));
  }, [categories.length]);

  const prevChannel = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  // التحكم بالكيبورد أثناء fullscreen
  useEffect(() => {
    const handleKey = (e) => {
      if (document.fullscreenElement) {
        if (e.key === "ArrowUp") nextChannel();
        if (e.key === "ArrowDown") prevChannel();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextChannel, prevChannel]);

  // تحميل الفيديو
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (Hls.isSupported() && !isIOS && streamUrl.endsWith(".m3u8")) {
      const hls = new Hls();
      hls.attachMedia(video);
      hls.loadSource(streamUrl);

      if (!currentChannel.stream_id) {
        setErr("No channel selected.");
        setLoading?.(false);
        return;
      }

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setErr("Network error. Retrying...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setErr("Media error. Attempting recovery...");
              hls.recoverMediaError();
              break;
            default:
              setErr("Fatal error loading stream.");
              hls.destroy();
              setLoading?.(false);
              break;
          }
        }
      });

      hlsInstance.current = hls;
    } else {
      video.src = streamUrl;
      video.addEventListener("error", () => {
        setErr("Error loading stream directly in video tag.");
        setLoading?.(false);
      });
    }

    return () => {
      hlsInstance.current?.destroy();
      hlsInstance.current = null;
    };
  }, [currentIndex, streamUrl, currentChannel.stream_id, setLoading]);

  return (
    <div
      className={`iptv-player ${isFocused === 3 ? "selected" : ""}`}
      tabIndex={0}
      aria-label="Live IPTV Player"
      ref={playerContainerRef}
      style={{ position: "relative", minHeight: 200 }}
    >
      {err && (
        <div className="error-message" role="alert" aria-live="assertive">
          <p>{err}</p>
        </div>
      )}

      {currentChannel && (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            controls={false}
            width="100%"
            height="100%"
            onClick={() => {
              if (playerContainerRef.current) {
                if (!document.fullscreenElement) {
                  playerContainerRef.current.requestFullscreen?.();
                } else {
                  document.exitFullscreen?.();
                }
              }
            }}
            onLoadedMetadata={() => {
              setLoading?.(false);
              setVideoLoading(false);
            }}
            onWaiting={() => setVideoLoading(true)}
            onPlaying={() => setVideoLoading(false)}
          >
            Your browser does not support the video tag.
          </video>

          {showOverlay && (
            <div className="channel-overlay">
              {currentChannel.stream_icon && (
                <img
                  src={currentChannel.stream_icon}
                  alt="logo"
                  style={{ width: 40, height: 40, marginRight: 10 }}
                />
              )}
              <span>{currentChannel.name}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default LivePlayer;
