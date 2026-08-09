// useDefaultCategoryEffect.js
import { useEffect } from "react";

export default function useDefaultCategoryEffect({
  categories,
  selectedCategory,
  setFocusedCategoryIndex,
  fetchCategoryRef,
  listItems,
  setListItems,
}) {
  useEffect(() => {
    if (!categories.length) return;

    const preferredCategoryId = selectedCategory || "2";
    const index = categories.findIndex(
      (c) => c.category_id === preferredCategoryId
    );
    const fallbackCategoryId = categories[0]?.category_id;

    const activeIndex = index !== -1 ? index : 0;
    const activeCategoryId =
      index !== -1 ? preferredCategoryId : fallbackCategoryId;

    if (activeCategoryId) {
      setFocusedCategoryIndex(activeIndex);

      const shouldKeepExistingList =
        selectedCategory &&
        listItems.length > 0 &&
        categories.some((c) => c.category_id === selectedCategory);

      if (shouldKeepExistingList) return;

      fetchCategoryRef.current?.(activeCategoryId);
    }
  }, [
    categories,
    selectedCategory,
    setFocusedCategoryIndex,
    fetchCategoryRef,
    listItems,
    setListItems,
  ]);
}
