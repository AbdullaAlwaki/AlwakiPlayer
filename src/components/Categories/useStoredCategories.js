// useStoredCategories.js
import { useMemo } from "react";

export default function useStoredCategories(isMovie) {
  return useMemo(
    () =>
      JSON.parse(
        sessionStorage.getItem(isMovie ? "movieCategories" : "seriesCategories")
      ),
    [isMovie]
  );
}
