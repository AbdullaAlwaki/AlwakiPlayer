import logo from "../../assets/logo.png";
import { useState, useEffect, useCallback, useRef } from "react";

const ImageWithFallback = ({ src, alt, onError: customOnError, rootRef }) => {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    setHasError(false);
    setCurrentSrc(null);
    setIsLoaded(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCurrentSrc(src || logo);
          observer.disconnect();
        }
      },
      {
        root: rootRef?.current || null,
        rootMargin: "280px",
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, rootRef]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
    if (customOnError) {
      customOnError();
    }
  }, [customOnError]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const imageSrc = hasError ? logo : currentSrc || logo;

  return (
    <div
      style={{
        minHeight: 100,
        minWidth: 70,
        background: "#222",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {!isLoaded && (
        <img
          src={logo}
          alt="placeholder"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 2,
            minHeight: 100,
            minWidth: 70,
            background: "#333",
          }}
        />
      )}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={handleError}
        onLoad={handleLoad}
        style={{
          minHeight: 100,
          minWidth: 70,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          background: "#222",
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      />
    </div>
  );
};

export default ImageWithFallback;