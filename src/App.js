import React, { useContext } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import LiveCategoriesList from "./components/LiveCategoriesList";
import MoviesList from "./components/MoviesList";
import SeriesList from "./components/SeriesList";
import ListDivision from "./components/ListDivision";
import Login from "./components/Login";
import { Context } from "./Util/createContext";



function App() {
  const { setServerUrl, setUsername, setPassword, setName } = useContext(Context);

  if (!localStorage.getItem("user")) {
    return <Login />;
  } else {
    const info = JSON.parse(localStorage.getItem("user"));
    setServerUrl(info.serverUrl);
    setUsername(info.username);
    setPassword(info.password);
    setName(info.name);
  }
  

  return (
    <div className="App">
      <ListDivision />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/live" element={<LiveCategoriesList />} />
        <Route path="/movies" element={<MoviesList />} />
        <Route path="/series" element={<SeriesList />} />
      </Routes>
    </div>
  );
}

export default App;
