import React, { useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../Util/createContext";
import "./Login.scss";

export default function LoginWithUrl() {
  const { setError, setLoading, setName } = useContext(Context);
  const navigate = useNavigate();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputs = useMemo(() => ["name", "serverUrl"], []);
  const inputRefs = useRef([]);

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setLoading(true);
      const name = inputRefs.current[0]?.value;
      const serverUrl = inputRefs.current[1]?.value;
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

  const handleEnter = useCallback(
    (e) => {
      e.preventDefault();
      if (focusedIndex < inputs.length) {
        inputRefs.current[focusedIndex]?.focus();
      } else {
        onSubmit(e);
      }
    },
    [focusedIndex, inputs.length, onSubmit]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;
      const isInputField = activeElement.tagName.toLowerCase() === "input";
      const isEmpty = isInputField && activeElement.value === "";
      switch (e.key) {
        case "ArrowDown":
        case "Down":
        case 40:
          setFocusedIndex((prevIndex) => Math.min(prevIndex + 1, inputs.length));
          break;
        case "ArrowUp":
        case "Up":
        case 38:
          setFocusedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
          break;
        case "Enter":
        case 13:
          handleEnter(e);
          break;
        case "Backspace":
        case 8:
          if (isInputField && isEmpty) {
            activeElement.blur();
          } else if (!isInputField || isEmpty) {
            navigate(-1);
          }
          break;
        default:
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [focusedIndex, navigate, inputs.length, onSubmit, handleEnter]);

  useEffect(() => {
    if (focusedIndex < inputs.length && inputRefs.current[focusedIndex]) {
      inputRefs.current[focusedIndex].focus();
    }
  }, [focusedIndex, inputs.length]);

  const getClassName = (index) => (focusedIndex === index ? "selected_input" : "");

  return (
    <div className="loginWithData">
      <form onSubmit={onSubmit} autoComplete="off">
        <h1>Login to your server</h1>
        {inputs.map((input, index) => (
          <div key={index} className={getClassName(index)}>
            <input
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              name={input}
              placeholder={
                index === 1
                  ? "http://yourserver.com:port"
                  : input.charAt(0).toUpperCase() + input.slice(1)
              }
              autoFocus={index === 0}
              tabIndex={index + 1}
              aria-label={input}
              onFocus={() => setFocusedIndex(index)}
            />
          </div>
        ))}
        <div className={getClassName(inputs.length)}>
          <button type="submit" tabIndex={inputs.length + 1} aria-label="Save Login">
            Save Login
          </button>
        </div>
      </form>
    </div>
  );
}
