import React from "react";
import { useNavigate } from "react-router-dom";
import IconTv from "../assets/icon-tv.png";
import IconMovie from "../assets/icon-movie.png";
import IconSeries from "../assets/icon-series.png";
import Logo from "../assets/logo.png";
import "../Style/ListDivision.scss";

export default function ListDivision() {
  const navigate = useNavigate();

  return (
    <div className="list-division"> 
      <div className="logo" onClick={() => navigate("/")}>
        <img
          src={Logo}
          alt=""
        />
      </div>
      <div className="division" onClick={() => navigate("/live")}>
        <img src={IconTv} alt="" />
        <span>Live TV</span>
      </div>
      <div className="division" onClick={() => navigate("/movies")}>
        <img src={IconMovie} alt="" />
        <span>Movie</span>
      </div>
      <div className="division" onClick={() => navigate("/series")}>
        <img src={IconSeries} alt="" />
        <span>Series</span>
      </div>
    </div>
  );
}
