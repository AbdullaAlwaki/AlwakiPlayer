import React, { useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Context } from "../../Util/createContext";
import "./Login.scss";

export default function LoginWithUrl({ isSelected }) {
  const { setError, setLoading, setName } = useContext(Context);
  const navigate = useNavigate();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputs = useMemo(() => ["name", "serverUrl", "username", "password"], []);
  const inputRefs = useRef([]);

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const name = inputRefs.current[0]?.value;
      const serverUrl = inputRefs.current[1]?.value;
      const username = inputRefs.current[2]?.value;
      const password = inputRefs.current[3]?.value;
      if (!name || !serverUrl || !username || !password) {
        setError("Please fill all the fields");
        return;
      }
      setName(name);
      setLoading(true);
      fetch(
        `${serverUrl}/player_api.php?username=${username}&password=${password}&action=user_info`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.user_info.auth === 1) {
            let userData = JSON.parse(localStorage.getItem("user")) || [];
            userData.push({ ...data, profile: name });
            localStorage.setItem("user", JSON.stringify(userData));
            setError(null);
            setLoading(false);
            navigate("/");
          } else {
            setLoading(false);
            setError("Invalid Credentials");
          }
        })
        .catch((error) => {
          setLoading(false);
          setError(error.toString());
        });
    },
    [setError, setLoading, setName, navigate]
  );

  const handleEnter = useCallback(
    (event) => {
      event.preventDefault();
      if (focusedIndex < inputs.length) {
        inputRefs.current[focusedIndex]?.focus();
      } else {
        onSubmit(event);
      }
    },
    [focusedIndex, inputs.length, onSubmit]
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      const activeElement = document.activeElement;
      const isInputField = activeElement.tagName.toLowerCase() === "input";
      const isEmpty = isInputField && activeElement.value === "";
      switch (event.key) {
        case "ArrowDown":
        case "Down":
        case 40:
          event.preventDefault();
          setFocusedIndex((prevIndex) => Math.min(prevIndex + 1, inputs.length));
          break;
        case "ArrowUp":
        case "Up":
        case 38:
          event.preventDefault();
          setFocusedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
          break;
        case "Enter":
        case 13:
          event.preventDefault();
          handleEnter(event);
          break;
        case "Backspace":
        case 8:
          event.preventDefault();
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
  }, [focusedIndex, navigate, onSubmit, handleEnter, inputs.length]);

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
              ref={el => (inputRefs.current[index] = el)}
              type={index === 3 ? "password" : "text"}
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
        <div className={getClassName(inputs.length) }>
          <button type="submit" tabIndex={inputs.length + 1} aria-label="Save Login">Save Login</button>
        </div>
      </form>
    </div>
  );
}

LoginWithUrl.propTypes = {
  isSelected: PropTypes.number,
};
