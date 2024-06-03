import React, { useContext } from "react";
import { Context } from "../Util/createContext";

import "../Style/Login.scss";

export default function Login() {
  const { error, setError, setLoading, setName, loading } = useContext(Context);

  const getInformation = (e) => {
    e.preventDefault();
    setLoading(true);
    const url = e.target.url.value;
    const name = e.target.Name.value;

    if (!url || !name) {
      setError("Please fill all the fields");
      return;
    }

    if (!url.includes("get.php")) {
      setError("Invalid URL");
      return;
    }

    const urlArr = url.split("/get.php?");
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
          localStorage.setItem(
            "user",
            JSON.stringify({ ...data, profile: name })
          );
          setLoading(false);
          setError(null);
          window.location.reload();
        } else {
          setLoading(false);
          setError("Invalid URL");
        }
      })
      .catch((error) => setError(error));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const serverUrl = e.target.serverUrl.value;
    const username = e.target.username.value;
    const password = e.target.password.value;

    if (!serverUrl || !username || !password) {
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
          localStorage.setItem("user", JSON.stringify({ ...data, profile: name }));
          setError(null);
          setLoading(false);
          window.location.reload();
        } else {
          setLoading(false);
          setError("Invalid Credentials");
        }
      })
      .catch((error) => setError(error));
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
      {loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "10%",
          }}
        >
          Loading...
        </div>
      )}
      {error && <div>{error.toString()}</div>}
    </div>
  );
}
