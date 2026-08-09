// useStoredCategories.js
import { useMemo } from "react";

export default function useStoredCategories(isMovie) {
  return useMemo(() => {
    try {
      const raw = sessionStorage.getItem(isMovie ? "movieCategories" : "seriesCategories");
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn("Failed to parse stored categories:", err);
      return null;
    }
  }, [isMovie]);
}
