import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function TrailerPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {

    const handleKeyDown = (e) => {
      console.log(e.key);
      
      if (e.key === "Escape" || e.key === "Backspace") {
        navigate(-1); // الرجوع عند ضغط Escape
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div className="trailer-player" style={{ width: "100%", height: "100vh" }}>
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${id}?autoplay=1`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{ border: "none" }}
      ></iframe>
    </div>
  );
}

export default TrailerPlayer;
