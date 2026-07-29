import logo from "../../assets/logo.png";
import { useState, useEffect, useCallback, useRef } from "react";


const ImageWithFallback = ({ src, alt, onError: customOnError }) => {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(null); // null initially
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    setHasError(false);
    setCurrentSrc(null);
    setIsLoaded(false);
    setIsVisible(false);
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setCurrentSrc(src);
          observer.disconnect();
        }
      },
      { threshold: 0.01 }
    );
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    return () => observer.disconnect();
  }, [src]);

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

  return (
    <div style={{ minHeight: 100, minWidth: 70, background: "#222", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
            background: "#333"
          }}
        />
      )}
      <img
        ref={imgRef}
        src={hasError ? logo : currentSrc}
        alt={alt}
        loading="lazy"
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
          transition: "opacity 0.3s"
        }}
      />
    </div>
  );
};

export default ImageWithFallback;