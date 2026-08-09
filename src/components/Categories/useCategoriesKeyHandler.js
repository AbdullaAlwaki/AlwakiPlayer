// useCategoriesKeyHandler.js
import { useCallback } from "react";

export default function useCategoriesKeyHandler({
  categories,
  focusedCategoryIndex,
  setFocusedCategoryIndex,
  focusedItemIndex,
  setFocusedItemIndex,
  isFocused,
  setIsFocused,
  listItems,
  isMovie,
  navigate,
  fetchCategoryRef,
}) {
  return useCallback(
    (e) => {
      if (
        ![
          "ArrowDown",
          "ArrowUp",
          "ArrowLeft",
          "ArrowRight",
          "Enter",
          "Backspace",
        ].includes(e.key)
      )
        return;
      e.preventDefault();

      if (isFocused === 1) {
        switch (e.key) {
          case "ArrowDown":
            setFocusedCategoryIndex((i) =>
              Math.min(i + 1, categories.length - 1)
            );
            break;
          case "ArrowUp":
            setFocusedCategoryIndex((i) => Math.max(i - 1, 0));
            break;
          case "Enter":
            fetchCategoryRef.current(categories[focusedCategoryIndex]?.category_id);
            break;
          case "ArrowLeft":
            setIsFocused(0);
            break;
          case "ArrowRight":
            setIsFocused(2);
            break;
        }
      } else if (isFocused === 2) {
        switch (e.key) {
          case "Backspace":
            setIsFocused(1);
            break;
          case "ArrowDown":
            if (!listItems.length) break;
            setFocusedItemIndex((i) =>
              Math.min(i + 5, listItems.length - 1)
            );
            break;
          case "ArrowUp":
            if (!listItems.length) break;
            setFocusedItemIndex((i) => Math.max(i - 5, 0));
            break;
          case "ArrowLeft":
            if (!listItems.length) break;
            if (focusedItemIndex % 5 === 0) {
              setIsFocused(1);
            } else {
              setFocusedItemIndex((i) => i - 1);
            }
            break;
          case "ArrowRight":
            if (!listItems.length) break;
            setFocusedItemIndex((i) =>
              Math.min(i + 1, listItems.length - 1)
            );
            break;
          case "Enter":
            if (listItems[focusedItemIndex]) {
              const item = listItems[focusedItemIndex];
              if (isMovie) {
                navigate(`/movies/m${item.stream_id}`);
              } else {
                navigate(`/series/s${item.series_id}`);
              }
            }
            break;
        }
      } else if (isFocused === 0) {
        if (e.key === "ArrowRight") {
          setIsFocused(1);
        }
      }

    },
    [
      categories,
      focusedCategoryIndex,
      focusedItemIndex,
      isFocused,
      listItems,
      isMovie,
      navigate,
      fetchCategoryRef,
    ]
  );
}
