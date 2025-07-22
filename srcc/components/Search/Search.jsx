import { useState, useContext, useEffect, useMemo } from "react";
import { Context } from "../../Util/createContext";
import ListDivision from "../ListDivision";
import MovieList from "../Movie/MovieList";
import SeriesList from "../Series/SeriesList";
import "./Search.scss";

function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchIn, setSearchIn] = useState("movie");
  const [data, setData] = useState([]);
  const { serverUrl, username, password } = useContext(Context);

  const urlMap = useMemo(
    () => ({
      live: `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams&category_id=0`,
      movie: `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_streams&category_id=0`,
      series: `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_series&category_id=0`,
    }),
    [serverUrl, username, password]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(urlMap[searchIn]);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (searchIn) fetchData(); // Fetch data only when searchIn changes
  }, [searchIn, urlMap]);

  const filteredResults = useMemo(() => {
    if (!query || data.length === 0) return [];
    return data.filter((item) =>
      item.name?.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, data]);

  useEffect(() => {
    setResults(filteredResults.slice(0, 10));
  }, [filteredResults]);

  return (
    <>
      <ListDivision />
      <div className="search-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
        />
        <div className="search-buttons">
          <button onClick={() => setSearchIn("live")}>Live</button>
          <button onClick={() => setSearchIn("movie")}>Movie</button>
          <button onClick={() => setSearchIn("series")}>Series</button>
        </div>
        <div className="search-results">
          {results.length === 0 && query && (
            <p>No results found for "{query}"</p>
          )}
          {searchIn === "live" && results.length > 0 && (
            <div></div>
          )}
          {searchIn === "movie" && results.length > 0 && (
            <MovieList moviesList={results} />
          
          )}
          {searchIn === "series" && results.length > 0 && (
            <SeriesList seriesList={results} />
          )}
        </div>
      </div>
    </>
  );
}

export default Search;
