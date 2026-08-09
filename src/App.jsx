import "./App.scss";
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const Home = lazy(() => import("./components/Home/Home"));
const LiveList = lazy(() => import("./components/Live/LiveCategoriesList"));
const List = lazy(() => import("./components/Categories/CategoriesList"));
const MovieData = lazy(() => import("./Util/SeriesData/SeriesData"));
const SeriesData = lazy(() => import("./Util/SeriesData/SeriesData"));
const Login = lazy(() => import("./components/Login/Login"));
const LoginWithData = lazy(() => import("./components/Login/LoginWithData"));
const LoginWithUrl = lazy(() => import("./components/Login/LoginWithUrl"));
const UserInfo = lazy(() => import("./components/UserInfo/UserInfo"));
const Player = lazy(() => import("./Player/Player"));
const Trailer = lazy(() => import("./Player/TrailerPlayer"));

function App() {
  return (
    <div className="App">
      <Suspense fallback={<div className="app-loading">Loading…</div>}>
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
      </Suspense>
    </div>
  );
}

export default App;
