import React, { useContext } from "react";
import { Context } from "../Util/createContext";
import { useNavigate } from "react-router-dom";

import "../Style/Home.scss";

export default function Home() {
  const { name, loading } = useContext(Context);
  const navigate = useNavigate();

  return (
    <div className="iptv-container">
      {loading && <div className="loading">Loading...</div>}
      <div>
        <h1>Welcome to IPTV</h1>
        <div><h2>Hi {name}</h2></div>

        <div>
          <h2>Choose your favorite</h2>
        </div>
      </div>

      <div
        className="iptv_container_img_live"
        onClick={() => navigate("/live")}
      ></div>

      <div
        className="iptv_container_img_series"
        onClick={() => navigate("/series")}
      ></div>

      <div
        className="iptv_container_img_movies"
        onClick={() => navigate("/movies")}
      ></div>
    </div>
  );
}
