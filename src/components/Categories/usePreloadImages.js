// usePreloadImages.js
import { useEffect, useRef } from "react";

export default function usePreloadImages(listItems) {
  const loadedImagesRef = useRef(new Set());
  
  useEffect(() => {
    const preloadImage = (src) => {
      return new Promise((resolve) => {
        if (!src || loadedImagesRef.current.has(src)) {
          resolve();
          return;
        }
        const img = new Image();
        img.src = `${src}?w=200&h=300`;
        img.onload = () => {
          loadedImagesRef.current.add(src);
          resolve();
        };
        img.onerror = () => {
          loadedImagesRef.current.add(src);
          resolve();
        };
      });
    };

    const loadImagesSequentially = async () => {
      const batchSize = 3;
      let index = 0;
      while (index < listItems.length) {
        const batch = listItems.slice(index, index + batchSize);
        await Promise.all(
          batch.map((item) => {
            const src = item.cover || item.stream_icon;
            return src ? preloadImage(src) : Promise.resolve();
          })
        );
        index += batchSize;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    };

    if (listItems.length > 0) {
      loadImagesSequentially();
    }
  }, [listItems]);
}
