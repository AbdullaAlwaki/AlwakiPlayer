import React, { useContext, useEffect } from "react";
import "./App.scss";
import { Routes, Route } from "react-router-dom";
import { Context } from "./Util/createContext";
import Home from "./components/Home";
import LiveList from "./components/Live/LiveCategoriesList";
import MoviesList from "./components/Movie/MoviesCategoriesList";
import MovieData from "./components/Movie/MovieData";
import SeriesList from "./components/Series/SeriesCategoriesList";
import SeriesData from "./components/Series/SeriesData";
import ListDivision from "./components/ListDivision";
import Login from "./components/Login";
import Player from "./Util/Player";



function App() {
  const { setServerUrl, setUsername, setPassword, setName, serverUrl
   } =
    useContext(Context);

  useEffect(() => {
    const localStor = JSON.parse(localStorage.getItem("user"));
    if (localStor !== null) {
      const info = JSON.parse(localStorage.getItem("user"));
      setServerUrl(
        `${info.server_info.server_protocol}://${info.server_info.url}:${info.server_info.port}`
      );
      setUsername(info.user_info.username);
      setPassword(info.user_info.password);
      setName(info.profile);
    }
  }, [setServerUrl, setUsername, setPassword, setName, serverUrl]);

  if (!localStorage.getItem("user")) {
    return <Login />;
  }
  

  return (
    <div className="App">
      <ListDivision />
      <Player/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/live" element={<LiveList />} />
        <Route path="/movies" element={<MoviesList />} />
        <Route path="/movies/:id" element={<MovieData />} />
        <Route path="/series" element={<SeriesList />} />
        <Route path="/series/:id" element={<SeriesData />} />
      </Routes>
    </div>
  );
}

export default App;
