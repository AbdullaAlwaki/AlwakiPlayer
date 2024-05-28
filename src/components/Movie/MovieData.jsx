import React, { useEffect, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { Context } from "../../Util/createContext";


export default function MovieData() {
  const { serverUrl, username, password } = useContext(Context);
  const [movieData, setMovieData] = useState([]);

  const id = useParams();

  useEffect(() => {
    fetch(
      `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_info&vod_id=${id.id}`
    )
      .then((response) => response.json())
      .then((data) => setMovieData(data))
      .catch((err) => console.log(err));
  }, [id]);

  const backdropImg = (movieData?.info?.backdrop || "").split("\r\n");
  console.log(movieData.info);
  return (
    <div>
      <h1>Movie Data</h1>
        {backdropImg.map((img, index) => (
          <div key={index}>
            <img src={img} alt="backdrop" className="backdrop" />
          </div>
        ))}


      <h2>{movieData?.info?.name}</h2>
      <p><h1>Cast</h1>{movieData?.info?.cast}</p>
      <p><h1>Director</h1>{movieData?.info?.director}</p>
      <p><h1>Plot</h1>{movieData?.info?.plot}</p>
      <p><h1>Rating</h1>{movieData?.info?.rating}</p>
      <p><h1>Release Date</h1>{movieData?.info?.releasedate}</p>
      <p><h1>Duration</h1>{movieData?.info?.duration}</p>
      <p><h1>Genre</h1>{movieData?.info?.genre}</p>
      <p><h1>duration_secs </h1>{movieData?.info?.duration_secs}</p>
    </div>
  );
}
