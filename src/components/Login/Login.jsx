import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dataImg from "../../assets/data.png";
import urlImg from "../../assets/url.png";
import "./Login.scss";
import { useState } from "react";

export default function Login() {
  const [isSelected, setIsSelected] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowRight":
        case 39:
          setIsSelected((prevIndex) => Math.min(prevIndex + 1, 1));
          break;
        case "ArrowLeft":
        case 37:
          setIsSelected((prevIndex) => Math.max(prevIndex - 1, 0));
          break;
        case "Enter":
        case 13:
          handleEnter();
          break;
        case "Backspace":
        case 8:
          navigate(-1);
          break;
        default:
          break;
      }
    };

    const handleEnter = () => {
      getData(isSelected)
    }; 
    
    const getData = (i)=>{
    if (i === 0) {
      navigate("/login/data");
    } else if (i === 1) {
      navigate("/Login/url");
    }
  }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSelected, navigate]);



  const getClassName = (index) => (isSelected === index ? "selected" : "");

  return (
    <div className="login-container">
      <h1> login with</h1>
      <div className="login_with">
        <div
          className={`${getClassName(0)} log_card`}
          onClick={() => navigate("/login/data")}
        >
          <img src={dataImg} alt="" />
          <p>Xtream Code</p>
        </div>
        <h2> Or </h2>
        <div
          className={`${getClassName(1)} log_card`}
          onClick={() => navigate("/login/url")}
        >
          <img src={urlImg} alt="" />
          <p>url</p>
        </div>
      </div>
    </div>
  );
}
