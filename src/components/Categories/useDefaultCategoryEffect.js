// useDefaultCategoryEffect.js
import { useEffect } from "react";

export default function useDefaultCategoryEffect(categories, setFocusedCategoryIndex, fetchCategoryRef) {
  useEffect(() => {
    if (categories.length > 0) {
      // البحث عن فهرس التصنيف ذو الـ ID=2
      const index = categories.findIndex(c => c.category_id === "2");
      if (index !== -1) {
        setFocusedCategoryIndex(index);
        fetchCategoryRef.current("2");
      } else {
        // إذا لم يكن موجودًا، نستخدم التصنيف الأول
        setFocusedCategoryIndex(0);
        fetchCategoryRef.current(categories[0]?.category_id);
      }
    }
  }, [categories, setFocusedCategoryIndex, fetchCategoryRef]);
}
