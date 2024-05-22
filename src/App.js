import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import LiveCategoriesList from './components/LiveCategoriesList';
import MoviesList from './components/MoviesList';
import SeriesList from './components/SeriesList';

function App() {

  

  return (
    <div className="App">
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
