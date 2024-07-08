import React, { useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../Util/createContext";
import "./Login.scss";

export default function LoginWithUrl() {
  const { setError, setLoading, setName } = useContext(Context);
  const navigate = useNavigate();
  const [focusedIndex, setFocusedIndex] = useState(0);

  const inputs = useMemo(()=>["name", "serverUrl"],[]); 

  const onSubmit = useCallback((e) => {
    e.preventDefault();
    setLoading(true);
    const name = document.getElementsByName("name")[0].value;
    const serverUrl = document.getElementsByName("serverUrl")[0].value;

    if (!serverUrl || !name) {
      setError("Please fill all the fields");
      setLoading(false);
      return;
    }

    if (!serverUrl.includes("get.php")) {
      setError("Invalid URL");
      setLoading(false);
      return;
    }

    const urlArr = serverUrl.split("/get.php?");
    const params = urlArr[1].split("&");
    const obj = {};
    params.forEach((param) => {
      const [key, value] = param.split("=");
      obj[key] = value;
    });

    setName(name);
    fetch(
      `${urlArr[0]}/player_api.php?username=${obj.username}&password=${obj.password}&action=user_info`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.user_info.auth === 1) {
          let userData = JSON.parse(localStorage.getItem("user")) || [];
          userData.push({ ...data, profile: name });
          localStorage.setItem("user", JSON.stringify(userData));
          setLoading(false);
          setError(null);
          navigate("/");
        } else {
          setLoading(false);
          setError("Invalid URL");
        }
      })
      .catch((error) => {
        setLoading(false);
        setError(error.message);
      });
  },
  [setError, navigate, setLoading, setName]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;
      const isInputField = activeElement.tagName.toLowerCase() === "input";
      const isEmpty = isInputField && activeElement.value === "";

      switch (e.key) {
        case "ArrowDown":
          setFocusedIndex((prevIndex) => Math.min(prevIndex + 1, 2));
          break;
        case "ArrowUp":
          setFocusedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
          break;
        case "Enter":
          handleEnter(e);
          break;
        case "Backspace":
          if (isInputField && isEmpty) {
            activeElement.blur();
          } else if (!isInputField || isEmpty) {
            navigate(-1);
          }
          break;
        default:
          // Ignore other keys
          break;
      }
    };
    
    const handleEnter = (e) => {
    e.preventDefault();
    if (focusedIndex < inputs.length) {
      const nextInput = document.getElementsByName(inputs[focusedIndex])[0];
      if (nextInput) {
        nextInput.focus();
      }
    } else {
      onSubmit(e);
    }
  };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [focusedIndex, navigate, inputs, onSubmit]);

  const getClassName = (index) => {
    return focusedIndex === index ? "selected_input" : "";
  };

  return (
    <div className="loginWithData">
      <form onSubmit={onSubmit}>
        <h1>Login to your server</h1>
        {inputs.map((input, index) => (
          <div key={index} className={getClassName(index)}>
            <input
              type="text"
              name={input}
              placeholder={
                index === 1
                  ? "http://yourserver.com:port"
                  : input.charAt(0).toUpperCase() + input.slice(1)
              }
              autoFocus={index === 0}
            />
          </div>
        ))}
        <div className={getClassName(2)}>
          <button type="submit">Save Login</button>
        </div>
      </form>
    </div>
  );
}
