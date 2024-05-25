import React, { createContext, useState, useEffect } from "react";

const Context = createContext();

function FetchData({ children }) {
  const [serverUrl, setServerUrl] = useState(""); //http://falconiptvpro.xyz:80 http://nasasmartv.com:8080
  const [username, setUsername] = useState(""); //16099570263 abdulkaderxalwaki
  const [password, setPassword] = useState(""); //05654272532 2449585kk
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [liveCategories, setLiveCategories] = useState([]);
  const [urlPlayer, setUrlPlayer] = useState("");
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const url = `${serverUrl}/player_api.php?username=${username}&password=${password}`;
    if (!serverUrl || !username || !password) {
      return;   
    }
    const fetchData = async () => { 
      try {
        const liveCategoriesResponse = await fetch(
          `${url}&action=get_live_categories`
        );
        const liveCategoriesData = await liveCategoriesResponse.json();
        liveCategoriesData.unshift({ category_id: "0", category_name: "All" });
        sessionStorage.setItem("liveCategories", JSON.stringify(liveCategoriesData));
        
        const vodCategoriesResponse = await fetch(
          `${url}&action=get_vod_categories`
        );
        const vodCategoriesData = await vodCategoriesResponse.json();
        vodCategoriesData.unshift({ category_id: "0", category_name: "All" });
        sessionStorage.setItem("vodCategories", JSON.stringify(vodCategoriesData));
        
/*         const vodStreamsResponse = await fetch(
          `${url}&action=get_vod_streams`
        );
        const vodStreamsData = await vodStreamsResponse.json();
        sessionStorage.setItem("vodStreams", JSON.stringify(vodStreamsData));
        console.log(vodStreamsData); */
        
        const seriesCategoriesResponse = await fetch(
          `${url}&action=get_series_categories`
        );
        const seriesCategoriesData = await seriesCategoriesResponse.json();
        seriesCategoriesData.unshift({ category_id: "0", category_name: "All" });
        sessionStorage.setItem("seriesCategories", JSON.stringify(seriesCategoriesData));

        setError(null);
      } catch (error) {
        setError(error);
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
        loading,
        setLoading,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export { Context, FetchData };
