import React, { useContext } from "react";
import ReactPlayer from "react-player";
import { Context } from "./createContext";
import "../Style/Player.scss";

const Player = () => {
  const { loading, setLoading, error, setError, urlPlayer } =
    useContext(Context);

  const fullScreen = () => {
    const elem = document.querySelector(".player-container");
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  const isLive = () => {
    if (urlPlayer.includes("m3u8") || urlPlayer.includes("m3u")) {
      return true;
    }
  };
  return (
    <div className="player-container" onClick={fullScreen}>
      {loading && !error && <div className="loading"></div>}
      {error ? (
        <div className="error">
          <span>{error}</span>
        </div>
      ) : (
        <ReactPlayer
          url={urlPlayer}
          playing
          width={"100%"}
          height={"100%"}
          controls={isLive() ? false : true}
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
            setError("Error loading video");
            setLoading(false);
          }}
        />
      )}
    </div>
  );
};

export default Player;
