import React, { createContext, useState, useEffect } from "react";

const Context = createContext();

function FetchData({ children }) {
  const [serverUrl, setServerUrl] = useState(""); //http://falconiptvpro.xyz:80 http://nasasmartv.com:8080
  const [username, setUsername] = useState(""); //16099570263 abdulkaderxalwaki
  const [password, setPassword] = useState(""); //05654272532 2449585kk
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [liveCategories, setLiveCategories] = useState([]);
  const [urlPlayer, setUrlPlayer] = useState("");
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    if (!localStorage.getItem("user")) return;
    

    const fetchData = async () => {
      const url = `${serverUrl}/player_api.php?username=${username}&password=${password}`;
      try {
        const userInfoResponse = await fetch(`${url}&action=user_info`);
        const userInfoData = await userInfoResponse.json();
        setUserInfo(userInfoData);
        const liveCategoriesResponse = await fetch(
          `${url}&action=get_live_categories`
        );
        const liveCategoriesData = await liveCategoriesResponse.json();
        setLiveCategories(liveCategoriesData);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [serverUrl, username, password]);

  return (
    <Context.Provider
      value={{
        serverUrl,
        setServerUrl,
        username,
        setUsername,
        password,
        setPassword,
        name,
        setName,
        error,
        setError,
        liveCategories,
        setLiveCategories,
        urlPlayer,
        setUrlPlayer,
        userInfo,
        setUserInfo,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export { Context, FetchData };
