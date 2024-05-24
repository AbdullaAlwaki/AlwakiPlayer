import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import LiveCategoriesList from "./components/LiveCategoriesList";
import MoviesList from "./components/MoviesList";
import SeriesList from "./components/SeriesList";
import ListDivision from "./components/ListDivision";
import Login from "./components/Login";



function App() {

  if (!localStorage.getItem("user")) {
    return <Login />;
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
