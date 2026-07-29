// useCategoriesLoader.js
import { useEffect } from "react";
import { fetchData } from "../../Util/helperfunction";

export default function useCategoriesLoader({
  storedCategories,
  favoriteList,
  setCategories,
  setLoading,
  serverUrl,
  username,
  password,
  setError,
  isMovie,
}) {
  useEffect(() => {
    if (storedCategories) {
      const updatedCategories = storedCategories.map((c) =>
        c.category_id === "1" ? { ...c, count: favoriteList.length } : c
      );
      setCategories(updatedCategories);
    } else {
      fetchData(
        setLoading,
        serverUrl,
        username,
        password,
        (data) => {
          const updatedData = data.map((c) =>
            c.category_id === "1" ? { ...c, count: favoriteList.length } : c
          );
          setCategories(updatedData);
          sessionStorage.setItem(
            isMovie ? "movieCategories" : "seriesCategories",
            JSON.stringify(updatedData)
          );
        },
        setError,
        isMovie ? "vod" : "series",
        isMovie ? "vod_streams" : "series"
      );
    }
  }, [
    storedCategories,
    favoriteList.length,
    serverUrl,
    username,
    password,
    setLoading,
    setError,
    isMovie,
    setCategories,
  ]);
}
