import { useState, useEffect, useRef, useContext, useCallback, useMemo } from "react";
import { Context } from "../../Util/createContext";

// ⚡ إعدادات HLS مبسطة ومتوافقة مع الهواتف
const HLS_CONFIG = {
  enableWorker: true,
  lowLatencyMode: true,
  liveSyncDurationCount: 2,
  liveMaxLatencyDurationCount: 4,
  liveDurationInfinity: true,
  maxBufferLength: 3,
  maxMaxBufferLength: 6,
  maxBufferHole: 0.5,
  maxStarvationDuration: 2,
  backBufferLength: 0,
  liveBackBufferLength: 0,
  frontBufferFlushThreshold: 1,
  highBufferDuration: 2,
  startFragPrefetch: true,
  progressive: true,
  startLevel: 0,
  capLevelToPlayerSize: false, // 🚀 تعطيل على الهواتف
  testBandwidth: false,        // 🚀 تعطيل على الهواتف
  abrEwmaFastLive: 0.5,
  abrEwmaSlowLive: 2.0,
  abrBandWidthFactor: 0.9,
  abrMaxWithRealBitrate: true,
  manifestLoadingTimeOut: 3000,
  manifestLoadingMaxRetry: 2,
  fragLoadingTimeOut: 3000,
  fragLoadingMaxRetry: 2,
  fragLoadingRetryDelay: 100,
  nudgeOffset: 0.1,
  nudgeMaxRetry: 5,
  stretchShortStreamTrack: true,
  forceKeyFrameOnDiscontinuity: true,
  appendErrorMaxRetry: 3,
  enableSoftwareAES: false,
  startPosition: 0,
  seekMode: "direct",
};

const MPEGTS_CONFIG = {
  enableWorker: true,
  liveBufferLatencyChasing: true,
  lazyLoad: false,
  lazyLoadMaxDuration: 0,
  autoCleanupSourceBuffer: true,
  fixAudioTimestampGap: true,
  accurateSeek: false,
  seekType: "range",
  rangeSeekZero: false,
  enableStashBuffer: false,
  stashInitialSize: 128,
  reuseRedirectedURL: true,
  deferLoadAfterSourceOpen: false,
};

const STALL_TIMEOUT = 5000;
const MAX_RETRIES = 5;
const PREFETCH_RANGE = 3;
const MIN_PLAY_DURATION = 10 * 60 * 1000;

function LivePlayer({ url, isFocused, playerContainerRef, categories }) {
  const videoRef = useRef(null);
  const hlsInstance = useRef(null);
  const mpegtsInstance = useRef(null);
  const overlayTimeout = useRef(null);
  const stallTimeout = useRef(null);
  const retryCount = useRef(0);
  const isRestarting = useRef(false);
  const prefetchCache = useRef(new Set());
  const streamStartTime = useRef(null);
  const hasPlayedSuccessfully = useRef(false);

  const { serverUrl, username, password, setLoading } = useContext(Context);

  const [err, setErr] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isIOSFakeFullscreen, setIsIOSFakeFullscreen] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  const [currentIndex, setCurrentIndex] = useState(
    categories.findIndex((c) => c.stream_id === url.id) || 0
  );

  const currentChannel = categories[currentIndex] || url;

  // 🚀 كشف نوع الجهاز
  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  const isIOS = useMemo(() => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }, []);

  // Preconnect للسيرفر
  useEffect(() => {
    if (!serverUrl) return;
    
    try {
      const urlObj = new URL(serverUrl);
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = urlObj.origin;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);

      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    } catch (e) {
      // تجاهل الأخطاء
    }
  }, [serverUrl]);

  const streamUrl = useMemo(
    () =>
      currentChannel
        ? `${serverUrl}/live/${username}/${password}/${currentChannel.stream_id}.${currentChannel.ext || "m3u8"}`
        : null,
    [serverUrl, username, password, currentChannel]
  );

  const streamType = useMemo(() => {
    if (!streamUrl) return null;
    const urlLower = streamUrl.toLowerCase();
    if (urlLower.includes(".m3u8")) return "hls";
    if (urlLower.includes(".ts")) return "mpegts";
    if (urlLower.includes(".mp4")) return "mp4";
    return "direct";
  }, [streamUrl]);

  const resetStreamTimer = useCallback(() => {
    streamStartTime.current = Date.now();
    hasPlayedSuccessfully.current = false;
  }, []);

  const shouldAutoRestart = useCallback(() => {
    if (!streamStartTime.current || !hasPlayedSuccessfully.current) {
      return false;
    }
    const elapsed = Date.now() - streamStartTime.current;
    return elapsed >= MIN_PLAY_DURATION;
  }, []);

  // 🚀 تنظيف مبسط ومتوافق مع الهواتف
  const cleanupVideo = useCallback(() => {
    const video = videoRef.current;
    
    if (hlsInstance.current) {
      try {
        hlsInstance.current.destroy();
      } catch (e) {
        console.warn("HLS destroy error:", e);
      }
      hlsInstance.current = null;
    }

    if (mpegtsInstance.current) {
      try {
        mpegtsInstance.current.destroy();
      } catch (e) {
        console.warn("MPEGTS destroy error:", e);
      }
      mpegtsInstance.current = null;
    }

    if (video) {
      // 🚀 تنظيف مباشر بدون requestAnimationFrame
      try {
        video.pause();
        video.removeAttribute("src");
        video.load();
        video.currentTime = 0;
        
        if (video.srcObject) {
          video.srcObject = null;
        }
      } catch (e) {
        console.warn("Video cleanup error:", e);
      }
    }

    if (stallTimeout.current) {
      clearTimeout(stallTimeout.current);
      stallTimeout.current = null;
    }
  }, []);

  const restartStream = useCallback(() => {
    if (isRestarting.current) return;
    isRestarting.current = true;

    console.log("🔄 Restarting stream...");
    cleanupVideo();
    resetStreamTimer();
    retryCount.current += 1;

    setTimeout(() => {
      setRestartKey((prev) => prev + 1);
      isRestarting.current = false;
    }, 200);
  }, [cleanupVideo, resetStreamTimer]);

  // عند تغيير القناة
  useEffect(() => {
    cleanupVideo();
    resetStreamTimer();
    setErr(null);
    setVideoLoading(true);
    
    if (isRestarting.current) {
      isRestarting.current = false;
    }
    retryCount.current = 0;
  }, [currentIndex, cleanupVideo, resetStreamTimer]);

  // 🚀 Prefetch مبسط ومتوافق مع الهواتف
  useEffect(() => {
    if (!categories.length || !serverUrl) return;

    const prefetchChannel = (index) => {
      if (index < 0 || index >= categories.length) return;
      const ch = categories[index];
      if (!ch.stream_id || prefetchCache.current.has(ch.stream_id)) return;

      const prefetchUrl = `${serverUrl}/live/${username}/${password}/${ch.stream_id}.${ch.ext || "m3u8"}`;
      
      const doFetch = () => {
        // 🚀 fetch بسيط بدون AbortController أو priority
        fetch(prefetchUrl, { method: "GET", mode: "no-cors" })
          .then(() => prefetchCache.current.add(ch.stream_id))
          .catch(() => {});
      };

      if ("requestIdleCallback" in window) {
        requestIdleCallback(doFetch, { timeout: 2000 });
      } else {
        setTimeout(doFetch, 100);
      }
    };

    for (let i = 1; i <= PREFETCH_RANGE; i++) {
      prefetchChannel(currentIndex + i);
      prefetchChannel(currentIndex - i);
    }
  }, [currentIndex, categories, serverUrl, username, password]);

  // مراقبة التوقف
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const checkStall = () => {
      if (video.paused || video.readyState < 3) {
        if (!shouldAutoRestart()) {
          return;
        }

        if (!stallTimeout.current) {
          stallTimeout.current = setTimeout(() => {
            if (video.paused || video.readyState < 3) {
              console.warn("⚠️ Stream stalled after 10+ minutes, restarting...");
              setErr(null);
              restartStream();
            }
          }, STALL_TIMEOUT);
        }
      } else {
        if (stallTimeout.current) {
          clearTimeout(stallTimeout.current);
          stallTimeout.current = null;
        }
        retryCount.current = 0;
      }
    };

    const events = ["waiting", "stalled", "error", "pause", "suspend"];
    events.forEach((event) => video.addEventListener(event, checkStall));

    const interval = setInterval(checkStall, 3000);

    return () => {
      events.forEach((event) => video.removeEventListener(event, checkStall));
      clearInterval(interval);
      if (stallTimeout.current) {
        clearTimeout(stallTimeout.current);
        stallTimeout.current = null;
      }
    };
  }, [restartStream, restartKey, shouldAutoRestart]);

  // Overlay
  useEffect(() => {
    setShowOverlay(true);
    if (overlayTimeout.current) clearTimeout(overlayTimeout.current);
    overlayTimeout.current = setTimeout(() => setShowOverlay(false), 3000);
    setErr(null);
    return () => clearTimeout(overlayTimeout.current);
  }, [currentIndex, currentChannel]);

  const nextChannel = useCallback(() => {
    setCurrentIndex((prev) => (prev < categories.length - 1 ? prev + 1 : prev));
  }, [categories.length]);

  const prevChannel = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleFullscreenToggle = useCallback(() => {
    const video = videoRef.current;
    const container = playerContainerRef.current;
    if (!video || !container) return;

    const isiPhone = /iPhone|iPod/.test(navigator.userAgent);

    if (isiPhone) {
      setIsIOSFakeFullscreen((prev) => !prev);
      setTimeout(() => video.play().catch(() => {}), 50);
    } else {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (container.requestFullscreen) container.requestFullscreen();
        else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
    }
  }, [playerContainerRef]);

  useEffect(() => {
    const handleKey = (e) => {
      const isFullscreen =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        isIOSFakeFullscreen;

      if (isFullscreen) {
        if (e.key === "ArrowUp") nextChannel();
        if (e.key === "ArrowDown") prevChannel();
        if (e.key === "Escape" || e.key === "Backspace" || e.key === "backspace") {
          if (isIOSFakeFullscreen) setIsIOSFakeFullscreen(false);
          else if (document.exitFullscreen) document.exitFullscreen();
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextChannel, prevChannel, isIOSFakeFullscreen]);

  // 🚀 تحميل الفيديو مع دعم الهواتف
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    let isMounted = true;

    if (retryCount.current > MAX_RETRIES) {
      setErr("Stream unavailable. Please try again later.");
      setLoading?.(false);
      return;
    }

    const initStream = async () => {
      if (!currentChannel.stream_id) {
        setErr("No channel selected.");
        setLoading?.(false);
        return;
      }

      cleanupVideo();
      resetStreamTimer();

      // MPEG-TS Stream
      if (streamType === "mpegts") {
        try {
          const mpegtsModule = await import("mpegts.js");
          const mpegts = mpegtsModule.default ?? mpegtsModule;

          // 🚀 على الهواتف: استخدام التحميل المباشر
          if (!mpegts.isSupported() || isMobile || !isMounted) {
            video.src = streamUrl;
            video.load();
            video.play().catch(() => {});
            video.addEventListener("error", () => {
              setErr("MPEG-TS not supported on this device.");
              setLoading?.(false);
            });
            return;
          }

          const player = mpegts.createPlayer(
            { type: "mpegts", isLive: true, url: streamUrl },
            MPEGTS_CONFIG
          );

          player.attachMediaElement(video);
          player.load();
          
          player.on(mpegts.Events.LOADING_COMPLETE, () => {
            if (isMounted && video.paused) {
              video.play().catch(() => {});
              setLoading?.(false);
            }
          });

          player.on(mpegts.Events.ERROR, (errorType, errorDetail) => {
            console.error(`MPEG-TS Error: ${errorType} - ${errorDetail}`);
            setLoading?.(false);
            player.destroy();
            if (shouldAutoRestart()) {
              restartStream();
            }
          });

          player.play().catch(() => {});
          mpegtsInstance.current = player;

        } catch (error) {
          setErr("Failed to load MPEG-TS player.");
          setLoading?.(false);
          if (shouldAutoRestart()) {
            restartStream();
          }
        }
        return;
      }

      // HLS Stream
      if (streamType === "hls") {
        try {
          const hlsModule = await import("hls.js");
          const Hls = hlsModule.default ?? hlsModule;

          // 🚀 على iOS: استخدام التشغيل الأصلي
          if (!Hls.isSupported() || isIOS || !isMounted) {
            video.src = streamUrl;
            video.preload = "auto";
            video.load();
            video.play().catch(() => {});
            video.addEventListener("error", () => {
              setErr("HLS not supported.");
              setLoading?.(false);
              if (shouldAutoRestart()) {
                restartStream();
              }
            });
            return;
          }

          const hls = new Hls(HLS_CONFIG);

          hls.attachMedia(video);
          hls.loadSource(streamUrl);

          hls.on(Hls.Events.FRAG_LOADED, () => {
            if (isMounted && video.paused) {
              video.play().catch(() => {});
            }
          });

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (isMounted) {
              video.play().catch(() => {});
              setLoading?.(false);
            }
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.warn("Network error detected.");
                  setLoading?.(false);
                  hls.destroy();
                  if (shouldAutoRestart()) {
                    restartStream();
                  }
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.warn("Media error detected.");
                  setLoading?.(false);
                  hls.destroy();
                  if (shouldAutoRestart()) {
                    restartStream();
                  }
                  break;
                default:
                  console.error("Fatal HLS error.");
                  setErr("Fatal HLS error.");
                  setLoading?.(false);
                  hls.destroy();
                  if (shouldAutoRestart()) {
                    restartStream();
                  }
              }
            }
          });

          hlsInstance.current = hls;

        } catch (error) {
          setErr("Failed to load HLS player.");
          setLoading?.(false);
          if (shouldAutoRestart()) {
            restartStream();
          }
        }
        return;
      }

      // بث مباشر
      video.src = streamUrl;
      video.preload = "auto";
      video.load();
      video.play().catch(() => {});
      video.addEventListener("error", () => {
        setErr("Error loading stream.");
        setLoading?.(false);
        if (shouldAutoRestart()) {
          restartStream();
        }
      });
    };

    initStream();

    return () => {
      isMounted = false;
      cleanupVideo();
    };
  }, [currentIndex, streamUrl, streamType, currentChannel.stream_id, setLoading, restartKey, restartStream, cleanupVideo, resetStreamTimer, shouldAutoRestart, isMobile, isIOS]);

  return (
    <div
      className={`iptv-player ${isFocused === 3 ? "selected" : ""} ${isIOSFakeFullscreen ? "ios-pwa-fullscreen" : ""}`}
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
            preload="auto"
            autoPlay
            playsInline
            controls={false}
            crossOrigin="anonymous"
            disablePictureInPicture
            disableRemotePlayback
            width="100%"
            height="100%"
            onClick={handleFullscreenToggle}
            onLoadedMetadata={() => {
              if (videoRef.current?.paused) videoRef.current.play().catch(() => {});
              setLoading?.(false);
              setVideoLoading(false);
            }}
            onWaiting={() => setVideoLoading(true)}
            onPlaying={() => {
              if (!hasPlayedSuccessfully.current) {
                hasPlayedSuccessfully.current = true;
              }
              setVideoLoading(false);
            }}
            onCanPlay={() => {
              if (videoRef.current?.paused) videoRef.current.play().catch(() => {});
            }}
            onStalled={() => {
              console.warn("Video stalled...");
            }}
            onSuspend={() => {
              console.warn("Video suspended...");
            }}
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