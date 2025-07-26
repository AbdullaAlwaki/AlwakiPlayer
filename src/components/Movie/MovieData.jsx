import { useEffect, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Context } from "../../Util/createContext";
import Carusel from "../../Util/Carusel";
import logo from "../../assets/Untitled-1.png";
import star from "../../assets/star.png";
import fillStar from "../../assets/fillStar.png";
import "./MovieData.scss";

export default function MovieData() {
  const navigate = useNavigate();
  // Keyboard: go back on Backspace or Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Backspace' || e.key === 'Escape') {
        navigate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
  const [movieData, setMovieData] = useState([]);
  const [index, setIndex] = useState(0);
  const [favoriteList, setFavoriteList] = useState(
    JSON.parse(localStorage.getItem("favoriteListMovie")) || []
  );
  const {
    serverUrl,
    username,
    password,
    setUrlPlayer,
    setError,
    setClosePlayer,
  } = useContext(Context);

  const id = useParams();

  const backdropImg = (movieData?.info?.backdrop || "")
    .split("\r\n")
    .slice(0, -1);
  if (backdropImg.length === 0) {
    backdropImg.push(logo);
  }

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_info&vod_id=${id.id}`
      );
      const data = await response.json();
      setMovieData(data);
    };
    fetchData();

    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % backdropImg.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [
    id.id,
    backdropImg.length,
    serverUrl,
    username,
    password,
    setUrlPlayer,
    movieData?.info?.youtube_trailer,
  ]);

  
  const handleMovieClick = async (movieId) => {
    setClosePlayer(true);
    setError("");
    try {
      const response = await fetch(
        `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_info&vod_id=${movieId}`
      );
      const data = await response.json();
      const streamUrl =
        data.movie_data.direct_source ||
        `${serverUrl}/movie/${username}/${password}/${movieId}.${data.movie_data.container_extension}`;
      setUrlPlayer(streamUrl);
    navigate("/player");

    } catch (error) {
      setError("Error fetching movie details:", error);
    }
  };

  const handleTrailerClick = () => {
    setError("");
    setClosePlayer(true);
    setUrlPlayer(
      `https://www.youtube.com/watch?v=${movieData?.info?.youtube_trailer}`
    );
    navigate("/player");
  };

  const inFavorite = (movieId) => {
    return favoriteList.some((item) => item.stream_id === movieId);
  };

  const handleFavorite = () => {
    const movieId = movieData?.movie_data?.stream_id;
    const isIn = favoriteList.some((item) => item.stream_id === movieId);

    let updatedFavoriteList;
    if (!isIn) {
      // Include the image URL in the favorite item
      const favoriteItem = {
        ...movieData?.movie_data,
        stream_icon: movieData?.info?.movie_image, // Add image URL here
      };
      updatedFavoriteList = [...favoriteList, favoriteItem];
    } else {
      updatedFavoriteList = favoriteList.filter(
        (item) => item.stream_id !== movieId
      );
    }

    setFavoriteList(updatedFavoriteList);
    localStorage.setItem(
      "favoriteListMovie",
      JSON.stringify(updatedFavoriteList)
    );
  };


  return (
    <div className="movieData">
      <Carusel index={index} backdropImg={backdropImg} />
      <div className="movieData_info">
        <div className="movieData_info_text">
          <p className="movieData_info_text_title">
            {movieData?.movie_data?.name}
          </p>
          <div className="movieData_info_text_info">
            <p className="movieData_info_text_genre">
              {movieData?.info?.genre}
            </p>
            <p className="movieData_info_text_rating">
              {movieData?.info?.rating}
              <span>&#9733;</span>
            </p>
            <p>{movieData?.info?.duration}</p>
          </div>

          <p className="movieData_info_text_description">
            {movieData?.info?.plot}
          </p>
          <div className="movieData_info_text_buttons">
            <button onClick={() => {handleMovieClick(id.id);

            }}>Play</button>
            {movieData?.info?.youtube_trailer === "" ? null : (
              <button onClick={handleTrailerClick}> Trailer </button>
            )}
            <button onClick={handleFavorite} className="favorite_icon">
              <img
                src={
                  inFavorite(movieData?.movie_data?.stream_id) ? fillStar : star
                }
                alt=""
                width={"30px"}
              />
            </button>
          </div>
        </div>

        <div className="movieData_info_details">
          <div className="movieData_info_details_release">
            <h2>Release Date</h2>
            <p>{movieData?.info?.releasedate}</p>
          </div>
          <div className="movieData_info_details_add">
            <h2>Added</h2>
            <p>
              {new Date(movieData?.movie_data?.added * 1000).toDateString()}
            </p>
          </div>
          <div className="movieData_info_details_cast">
            <h2>The Actors</h2>
            <p>{movieData?.info?.cast}</p>
          </div>
          <div className="movieData_info_details_director">
            <h2>Director</h2>
            <p>{movieData?.info?.director}</p>
          </div>
        </div>
      </div>

      <div className="movieData_image">
        <p>{movieData?.info?.age}</p>
        <img src={movieData?.info?.movie_image} alt="" />
      </div>

    </div>
  );
}
