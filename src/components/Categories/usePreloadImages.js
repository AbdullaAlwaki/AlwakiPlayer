// usePreloadImages.js
import { useEffect } from "react";

export default function usePreloadImages(listItems) {
  useEffect(() => {
    if (!Array.isArray(listItems) || listItems.length === 0) return undefined;

    let cancelled = false;
    const maxPreload = 12;
    const preloadQueue = listItems.slice(0, maxPreload);

    const preloadImage = (src) => {
      return new Promise((resolve) => {
        if (!src || cancelled) {
          resolve();
          return;
        }

        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = `${src}?w=200&h=300`;
      });
    };

    const preloadBatch = async () => {
      const workers = Math.min(4, preloadQueue.length);
      let index = 0;

      const worker = async () => {
        while (!cancelled && index < preloadQueue.length) {
          const currentIndex = index++;
          const item = preloadQueue[currentIndex];
          const src = item?.cover || item?.stream_icon;
          await preloadImage(src);
        }
      };

      await Promise.all(
        Array.from({ length: workers }, () => worker())
      );
    };

    preloadBatch();

    return () => {
      cancelled = true;
    };
  }, [listItems]);
}
