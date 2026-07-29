// usePreloadImages.js
import { useEffect } from "react";

export default function usePreloadImages(listItems) {
  useEffect(() => {
    const preloadImage = (src) => {
      return new Promise((resolve) => {
        if (!src) {
          resolve();
          return;
        }
        const img = new Image();
        img.src = `${src}?w=200&h=300`;
        img.onload = resolve;
        img.onerror = resolve;
      });
    };

    const loadImagesSequentially = async () => {
      const batchSize = 5;
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
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    };

    if (listItems.length > 0) {
      loadImagesSequentially();
    }
  }, [listItems]);
}
