import "./App.scss";
import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Home from "./components/Home/Home";
import LiveList from "./components/Live/LiveCategoriesList";
import MovieData from "./Util/SeriesData/SeriesData";
import List from "./components/Categories/CategoriesList";
import SeriesData from "./Util/SeriesData/SeriesData";
import Login from "./components/Login/Login";
import LoginWithData from "./components/Login/LoginWithData"
import LoginWithUrl from "./components/Login/LoginWithUrl";
import Player from "./Player/Player";
import Trailer from "./Player/TrailerPlayer";
import UserInfo from "./components/UserInfo/UserInfo";

function App() {

  // Add global keydown listener for Backspace and Escape
  const navigate = useNavigate();
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.keyCode) {
        case 37: console.log("Left"); break;
        case 38: console.log("Up"); break;
        case 39: console.log("Right"); break;
        case 40: console.log("Down"); break;
        case 13: console.log("Enter/OK"); break;
        case 461: console.log("Back"); break;
        case 36: console.log("Home"); break;
        case 447: console.log("Volume Up"); break;
        case 448: console.log("Volume Down"); break;
        case 449: console.log("Mute"); break;
        case 415: console.log("Play/Pause"); break;
        case 413: console.log("Stop"); break;
        case 412: console.log("Rewind"); break;
        case 417: console.log("Fast Forward"); break;
        case 457: console.log("Info"); break;
        case 403: console.log("Red"); break;
        case 404: console.log("Green"); break;
        case 405: console.log("Yellow"); break;
        case 406: console.log("Blue"); break;
        default: console.log("Other button", e.keyCode);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div className="App">
      <Routes>
        <Route path="/*" element={<Home />} />
        <Route path="/Player" element={<Player />} />
        <Route path="/trailer/:id" element={<Trailer />} />
        <Route path="/live" element={<LiveList />} />
        <Route path="/movies" element={<List />} />
        <Route path="/movies/:id" element={<MovieData />} />
        <Route path="/series" element={<List />} />
        <Route path="/series/:id" element={<SeriesData />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/data" element={<LoginWithData />} />
        <Route path="/login/url" element={<LoginWithUrl />} />
        <Route path="/profile" element={<UserInfo />} />
      </Routes>

    </div>
  );
}

export default App;
