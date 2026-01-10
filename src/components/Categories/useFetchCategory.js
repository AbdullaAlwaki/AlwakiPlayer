// useFetchCategory.js
import { useCallback } from "react";

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
  return useCallback(
    async (id) => {
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
        const data = await (
          await fetch(
            `${serverUrl}/player_api.php?username=${username}&password=${password}&action=${action}&category_id=${catId}&sort_by=added&sort_dir=desc`
          )
        ).json();

        const filteredData =
          id === "2"
            ? data
                .sort((a, b) => parseFloat(b.added) - parseFloat(a.added))
                .slice(0, 30)
            : data;

        setListItems(filteredData);
        listCache.current[id] = filteredData;
      } catch (err) {
        setError("Error fetching list: " + err.message);
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
