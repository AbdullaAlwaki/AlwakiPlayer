// useFetchCategory.js
import { useCallback, useRef, useEffect } from "react";

export default function useFetchCategory({
  setSelectedCategory,
  setFocusedItemIndex,
  setIsFocused,
  listCache,
  setListItems,
  favoriteList,
  isMovie,
  serverUrl,
  username,
  password,
  setError,
}) {
  const controllerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, []);

  return useCallback(
    async (id) => {
      // abort previous pending request to avoid races
      if (controllerRef.current) controllerRef.current.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setSelectedCategory(id);
      setFocusedItemIndex(0);
      setIsFocused(2);

      if (listCache.current[id]) {
        setListItems(listCache.current[id]);
        return;
      }

      if (id === "1") {
        setListItems(favoriteList);
        return;
      }

      const action = isMovie ? "get_vod_streams" : "get_series";
      const catId = id === "2" ? 0 : id;

      try {
        const res = await fetch(
          `${serverUrl}/player_api.php?username=${username}&password=${password}&action=${action}&category_id=${catId}&sort_by=added&sort_dir=desc`,
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        const filteredData =
          id === "2"
            ? data
                .sort((a, b) => parseFloat(b.added) - parseFloat(a.added))
                .slice(0, 30)
            : data;

        setListItems(filteredData);
        listCache.current[id] = filteredData;
      } catch (err) {
        if (err.name === "AbortError") return;
        setError("Error fetching list: " + (err.message || err));
      }
    },
    [
      setSelectedCategory,
      setFocusedItemIndex,
      setIsFocused,
      listCache,
      setListItems,
      favoriteList,
      isMovie,
      serverUrl,
      username,
      password,
      setError,
    ]
  );
}
