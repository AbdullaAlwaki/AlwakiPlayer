import React, { useContext, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Context } from "./createContext";
import "../Style/Player.scss";

const Player = () => {
  const {
    loading,
    setLoading,
    error,
    setError,
    urlPlayer,
    setClosePlayer,
    closePlayer,
  } = useContext(Context);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const playRef = useRef(null);

  const playerRef = useRef();

  useEffect(() => {
    if (urlPlayer) {
      const currentEpisode = urlPlayer?.split("/")[6].split(".")[0];
      setCurrentEpisodeIndex(currentEpisode);
      const savedPlayedSeconds = localStorage.getItem(
        `${currentEpisode}`
      );
      if (savedPlayedSeconds) {
        setPlayedSeconds(parseFloat(savedPlayedSeconds));
      } else {
        setPlayedSeconds(0);
      }
    }
  }, [urlPlayer]);

  const handleProgress = (state) => {
    setPlayedSeconds(state.playedSeconds);
    localStorage.setItem(
      `${currentEpisodeIndex}`,
      state.playedSeconds
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (playerRef.current && !playerRef.current.contains(event.target)) {
        setClosePlayer(false);
      }
    };
    if (closePlayer) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line
  }, [closePlayer, setClosePlayer]);
console.log(playedSeconds);
  return (
    <>
      {closePlayer ? (
        <div className="player-container">
          {loading && !error && <div className="loading"></div>}
          {error ? (
            <div className="error" ref={playerRef}>
              <span>{error}</span>
            </div>
          ) : (
            <div className="player">
              <div className="player_overlay" ref={playerRef}>
                <ReactPlayer
                  ref={playRef}
                  url={urlPlayer}
                  onProgress={handleProgress}
                  playing
                  played={playedSeconds}
                  
                  width={"100%"}
                  height={"100%"}
                  controls
                  onBufferEnd={() => {
                    setLoading(false);
                    setError(null);
                  }}
                  onReady={() => {
                    setError(null);
                    setLoading(true);
                  }}
                  onBuffer={() => setLoading(true)}
                  onEnded={() => setLoading(false)}
                  onPause={() => setLoading(false)}
                  onError={(error) => {
                    setError(`Error loading video: ${error}`);
                    setLoading(false);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
};

export default Player;
