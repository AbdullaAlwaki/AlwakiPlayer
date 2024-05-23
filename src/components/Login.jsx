import React, { useContext } from "react";
import { Context } from "../Util/createContext";

import "../Style/Login.scss";

export default function Login() {
  const {
    error,
    setError,
  } = useContext(Context);

  const getInformation = (e) => {
    e.preventDefault();
    const url = e.target.url.value;
    const name = e.target.Name.value;
    if (url.includes("get.php")) {
      const urlArr = url.split("/get.php?");
      const params = urlArr[1].split("&");
      const obj = {};
      params.forEach((param) => {
        const [key, value] = param.split("=");
        obj[key] = value;
      });
      
      setError(null);
      localStorage.setItem(
        "user",
        JSON.stringify({
          serverUrl: urlArr[0],
          username: obj.username,
          password: obj.password,
          name,
        })
      );
      window.location.reload();
    } else {
      setError("Invalid URL");
    }
  };



  const onSubmit = (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const serverUrl = e.target.serverUrl.value;
    const username = e.target.username.value;
    const password = e.target.password.value;
    console.log(name, serverUrl, username, password);
    if (!serverUrl || !username || !password) {
      setError("Please fill all the fields");
      return;
    }
    localStorage.setItem(
      "user",
      JSON.stringify({
        serverUrl,
        username,
        password,
        name,
      })
    );
    setError(null);
    window.location.reload();
  };

  return (
    <div className="login-container">
      <form onSubmit={onSubmit}>
        <h1>Login to your server</h1>
        <div>
          <input type="text" id="name" placeholder="Name" />
        </div>
        <div>
          <input
            type="text"
            id="serverUrl"
            placeholder="http://yourserver.com:port"
          />
        </div>
        <div>
          <input type="text" id="username" placeholder="Username" />
        </div>
        <div>
          <input type="password" id="password" placeholder="Password" />
        </div>
        <div>
          <button>Save Login</button>
        </div>
      </form>

      <h2>Or</h2>

      <form className="login-with-url" onSubmit={getInformation}>
        <h3>login with your server url</h3>
        <input type="text" id="Name" placeholder="Your Playlist Name" />
        <input type="text" id="url" placeholder="Your server url" />
        <button>Save Login</button>
      </form>

      {error && <div>{error}</div>}
    </div>
  );
}
