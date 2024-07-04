import React, { useContext } from "react";
import "./App.scss";
import { Routes, Route } from "react-router-dom";
import { Context } from "./Util/createContext";
import Home from "./components/Home/Home";
import LiveList from "./components/Live/LiveCategoriesList";
import MoviesList from "./components/Movie/MoviesCategoriesList";
import MovieData from "./components/Movie/MovieData";
import SeriesList from "./components/Series/SeriesCategoriesList";
import SeriesData from "./components/Series/SeriesData";
import Login from "./components/Login/Login";
import LoginWithData from "./components/Login/LoginWithData"
import LoginWithUrl from "./components/Login/LoginWithUrl";
import Player from "./Util/Player";
import Loading from "./components/Loading/Loading";

function App() {
  const { loading } = useContext(Context);

  return (
    <div className="App">
      <Player />
      <Routes>
        <Route path="/*" element={<Home />} />
        <Route path="/live" element={<LiveList />} />
        <Route path="/movies" element={<MoviesList />} />
        <Route path="/movies/:id" element={<MovieData />} />
        <Route path="/series" element={<SeriesList />} />
        <Route path="/series/:id" element={<SeriesData />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/data" element={<LoginWithData />} />
        <Route path="/login/url" element={<LoginWithUrl />} />
      </Routes>

      <Loading loading={loading} />
    </div>
  );
}

export default App;
