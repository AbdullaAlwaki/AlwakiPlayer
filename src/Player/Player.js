import React, { useContext, useEffect, useRef, useState } from "react";
import { Context } from "../Util/createContext";
import "./Player.scss";

const Player = () => {
  const { setLoading, setError, urlPlayer, /* setClosePlayer,  closePlayer*/ } =
    useContext(Context);

  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState("");
  const [err, setErr] = useState(null);
  const videoRef = useRef(null);
  const iframeRef = useRef(null);

  // Detect if the URL is a YouTube link
  const isYouTubeUrl = (url) => {
    return (
      /youtube\.com\/watch\?v=/.test(url) ||
      /youtu\.be\/[a-zA-Z0-9_-]+/.test(url)
    );
  };

  useEffect(() => {
    if (urlPlayer) {
      if (!isYouTubeUrl(urlPlayer)) {
        const segments = urlPlayer.split("/");
        const episodeSegment = segments.length > 6 ? segments[6] : "";
        const currentEpisode = episodeSegment.split(".")[0];
        setCurrentEpisodeIndex(currentEpisode);
      } else {
        setCurrentEpisodeIndex("");
      }
    }
  }, [urlPlayer]);

  useEffect(() => {
    if (/* closePlayer && */ !isYouTubeUrl(urlPlayer)) {
      if (videoRef.current) {
        const savedPlayedSeconds = localStorage.getItem(
          `${currentEpisodeIndex}`
        );
        if (savedPlayedSeconds) {
          videoRef.current.currentTime = parseFloat(savedPlayedSeconds);
        }

        const handleTimeUpdate = () => {
          if (videoRef.current) {
            const currentTime = videoRef.current.currentTime;
            localStorage.setItem(
              `${currentEpisodeIndex}`,
              currentTime.toString()
            );
          }
        };

        videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
        videoRef.current.addEventListener("play", () => setLoading(false));
        videoRef.current.addEventListener("pause", () => setLoading(false));
        videoRef.current.addEventListener("ended", () => setLoading(false));
        videoRef.current.addEventListener("error", (error) => {
          setErr(`Error loading video: ${error}`);
          setLoading(false);
        });

        return () => {
          if (videoRef.current) {
            videoRef.current.removeEventListener(
              "timeupdate",
              handleTimeUpdate
            );
            videoRef.current.removeEventListener("play", () =>
              setLoading(false)
            );
            videoRef.current.removeEventListener("pause", () =>
              setLoading(false)
            );
            videoRef.current.removeEventListener("ended", () =>
              setLoading(false)
            );
            videoRef.current.removeEventListener("error", (error) => {
              setErr(`Error loading video: ${error}`);
              setLoading(false);
            });
          }
        };
      }
    }
  }, [/* closePlayer, */ urlPlayer, currentEpisodeIndex, setLoading, setError]);

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (iframeRef.current && !iframeRef.current.contains(event.target)) {
  //       setClosePlayer(false);
  //     }
  //   };

  //   if (closePlayer) {
  //     document.addEventListener("mousedown", handleClickOutside);
  //   }

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [closePlayer, setClosePlayer]);

  return (
    <>
      {/* {closePlayer && ( */}
        <div className="player-container">
          <div className="player">
            {err ?  (
              <p>{err}</p>
            ) :(
              <div className="player_overlay" ref={iframeRef}>
                {isYouTubeUrl(urlPlayer) ? (
                  <div className="youtube-container">
                    <iframe
                      src={`https://www.youtube.com/embed/${
                        new URL(urlPlayer).searchParams.get("v") ||
                        urlPlayer.split("/").pop()
                      }?autoplay=1`}
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      title="YouTube video player"
                    />
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    className="video-player"
                    controls
                    autoPlay
                    preload="auto"
                    src={urlPlayer}
                    // autoFullScreen
                  />
                )}
              </div>
            )}
          </div>
        </div>
      {/* )} */}
    </>
  );
};

export default Player;
