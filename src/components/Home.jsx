import React, { useEffect, useState, useContext } from "react";
import { Context } from "../Util/createContext";

import "../Style/Home.scss";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [data, setData] = useState([]);
  const { setServerUrl, setUsername, setPassword, setName } =
    useContext(Context);

  const navigate = useNavigate();

  useEffect(() => {
    const localStor = JSON.parse(localStorage.getItem("user"));
    if (localStor !== null) {
      const info = JSON.parse(localStorage.getItem("user"));
      setServerUrl(
        `${info.server_info.server_protocol}://${info.server_info.url}:${info.server_info.port}`
      );
      setUsername(info.user_info.username);
      setPassword(info.user_info.password);
      setName(info.name);
    }

    setData(localStor);
  }, [ setServerUrl, setUsername, setPassword, setName]);

  return (
    <div className="iptv-container">
      <div>
        <h1>Welcome to IPTV</h1>
        <div>
          <h2>Hi {data.name}</h2>
        </div>

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
