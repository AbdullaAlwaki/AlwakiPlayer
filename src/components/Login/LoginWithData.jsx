import React, { useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../Util/createContext";
import "./Login.scss";

export default function LoginWithUrl({ isSelected }) {
  const { setError, setLoading, setName } = useContext(Context);
  const navigate = useNavigate();
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const inputs = useMemo(()=>["name", "serverUrl", "username", "password"],[]);

  const onSubmit = useCallback((e) => {
    e.preventDefault();
    const name = document.getElementsByName("name")[0].value;
    const serverUrl = document.getElementsByName("serverUrl")[0].value;
    const username = document.getElementsByName("username")[0].value;
    const password = document.getElementsByName("password")[0].value;

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

  useEffect(() => {
    const handleKeyDown = (event) => {
      const activeElement = document.activeElement;
      const isInputField = activeElement.tagName.toLowerCase() === "input";
      const isEmpty = isInputField && activeElement.value === "";

      switch (event.key) {
        case "ArrowDown":
          setFocusedIndex((prevIndex) => Math.min(prevIndex + 1, 4));
          break;
        case "ArrowUp":
          setFocusedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
          break;
        case "Enter":
          handleEnter(event);
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

    const handleEnter = (event) => {
      event.preventDefault();
  
      if (focusedIndex < 4) {
        const nextInput = document.getElementsByName(inputs[focusedIndex])[0];
        if (nextInput) {
          nextInput.focus();
        }
      } else {
        onSubmit(event);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [focusedIndex, navigate, onSubmit, inputs]);


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
              type={index === 3 ? "password" : "text"}
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
        <div className={getClassName(4)}>
          <button type="submit">Save Login</button>
        </div>
      </form>
    </div>
  );
}
