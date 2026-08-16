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
