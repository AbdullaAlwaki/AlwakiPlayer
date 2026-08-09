import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import dataImg from "../../assets/data.png";
import urlImg from "../../assets/url.png";
import "./Login.scss";

const loginOptions = [
  {
    label: "Xtream Code",
    img: dataImg,
    alt: "Xtream Code login",
    path: "/login/data",
  },
  {
    label: "url",
    img: urlImg,
    alt: "URL login",
    path: "/login/url",
  },
];

export default function Login() {
  const [isSelected, setIsSelected] = useState(0);
  const navigate = useNavigate();

  const getData = useCallback((i) => {
    navigate(loginOptions[i].path);
  }, [navigate]);

  const handleEnter = useCallback(() => {
    getData(isSelected);
  }, [getData, isSelected]);

  const handleKeyDown = useCallback((event) => {
    switch (event.key) {
      case "ArrowRight":
      case "Right":
      case 39:
      case "ArrowDown":
      case "Down":
      case 40:
        event.preventDefault();
        setIsSelected((prevIndex) => Math.min(prevIndex + 1, loginOptions.length - 1));
        break;
      case "ArrowLeft":
      case "Left":
      case 37:
      case "ArrowUp":
      case "Up":
      case 38:
        event.preventDefault();
        setIsSelected((prevIndex) => Math.max(prevIndex - 1, 0));
        break;
      case "Enter":
      case 13:
        event.preventDefault();
        handleEnter();
        break;
      case "Backspace":
      case 8:
        event.preventDefault();
        navigate(-1);
        break;
      default:
        break;
    }
  }, [handleEnter, navigate]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const getClassName = (index) => (isSelected === index ? "selected" : "");

  return (
    <div className="login-container">
      <h1>Login with</h1>
      <div className="login_with">
        {loginOptions.map((option, idx) => (
          <div
            key={option.label}
            className={`${getClassName(idx)} log_card`}
            onClick={() => navigate(option.path)}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate(option.path);
              }
            }}
          >
            <img src={option.img} alt={option.alt} />
            <p>{option.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
