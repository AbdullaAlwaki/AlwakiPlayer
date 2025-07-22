import mutedIcon from "../../assets/muted.svg";
import unmutedIcon from "../../assets/unmuted.svg";

const PlayerController = ({ muted, onToggleMute }) => {
  return (
    <button
      style={{
        position: "absolute",
        bottom: 10,
        right: 10,
        zIndex: 2,
        background: "rgba(0,0,0,0.5)",
        border: "none",
        borderRadius: "50%",
        width: 36,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
      aria-label={muted ? "Unmute" : "Mute"}
      onClick={(e) => {
        e.stopPropagation();
        onToggleMute();
      }}
    >
      {muted ? (
        <img src={mutedIcon} alt="Muted" width={22} height={22} />
      ) : (
        <img src={unmutedIcon} alt="Unmuted" width={22} height={22} />
      )}
    </button>
  );
};

export default PlayerController;
