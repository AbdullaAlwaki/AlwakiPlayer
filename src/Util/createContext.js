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
    const url = `${serverUrl}/player_api.php?username=${username}&password=${password}`;
    if (!serverUrl || !username || !password) {
      return;   
    }
    fetch(`${url}&action=user_info`)
      .then((response) => response.json())
      .then((data) => {
    localStorage.setItem("user", JSON.stringify({...data, user : name}))
      })
      .catch((error) => setError(error));
    const fetchData = async () => { 
      try {


        const liveCategoriesResponse = await fetch(
          `${url}&action=get_live_categories`
        );
        const liveCategoriesData = await liveCategoriesResponse.json();
        localStorage.setItem("liveCategories", JSON.stringify(liveCategoriesData));

        const vodCategoriesResponse = await fetch(
          `${url}&action=get_vod_categories`
        );
        const vodCategoriesData = await vodCategoriesResponse.json();
        localStorage.setItem("vodCategories", JSON.stringify(vodCategoriesData));

        const seriesCategoriesResponse = await fetch(
          `${url}&action=get_series_categories`
        );
        const seriesCategoriesData = await seriesCategoriesResponse.json();
        localStorage.setItem("seriesCategories", JSON.stringify(seriesCategoriesData));

        const liveStreamsResponse = await fetch(
          `${url}&action=get_live_streams`
        );
        const liveStreamsData = await liveStreamsResponse.json();
        localStorage.setItem("liveStreams", JSON.stringify(liveStreamsData));



        const seriesStreamsResponse = await fetch(
          `${url}&action=get_series`
        );
        const seriesStreamsData = await seriesStreamsResponse.json();
        localStorage.setItem("seriesStreams", JSON.stringify(seriesStreamsData));
        
      } catch (error) {
        setError(error);
      }
    };
    fetchData();
  }, [serverUrl, username, password, name]);

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
