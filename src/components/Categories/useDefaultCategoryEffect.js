// useDefaultCategoryEffect.js
import { useEffect } from "react";

export default function useDefaultCategoryEffect(categories, setFocusedCategoryIndex, fetchCategoryRef) {
  useEffect(() => {
    if (!categories.length) return;

    const defaultCategoryId = "2";
    const index = categories.findIndex((c) => c.category_id === defaultCategoryId);
    const fallbackCategoryId = categories[0]?.category_id;

    const activeIndex = index !== -1 ? index : 0;
    const activeCategoryId =
      index !== -1 ? defaultCategoryId : fallbackCategoryId;

    if (activeCategoryId) {
      setFocusedCategoryIndex(activeIndex);
      fetchCategoryRef.current?.(activeCategoryId);
    }
  }, [categories, setFocusedCategoryIndex, fetchCategoryRef]);
}
