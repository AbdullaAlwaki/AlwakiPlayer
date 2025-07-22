import { useContext, useEffect, useRef, useState } from "react";
import { Context } from "../../Util/createContext";
import './Error.scss';

export default function Error() {
  const { error } = useContext(Context);
  const [visible, setVisible] = useState(!!error);
  const errorRef = useRef(null);

  useEffect(() => {
    setVisible(!!error);
  }, [error]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (errorRef.current && !errorRef.current.contains(event.target)) {
        setVisible(false);
      }
    };

    const handlePopState = (event) => {
      setVisible(false);
      window.history.replaceState({}, document.title);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("keydown", handleKeyDown);

    window.history.pushState({}, document.title);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="overlay">
      <button className="close-button" onClick={handleClose}>x</button>
      <div className="main_error" ref={errorRef}>
        {error && <div className="error">{error.toString()}</div>}
      </div>
    </div>
  );
}
