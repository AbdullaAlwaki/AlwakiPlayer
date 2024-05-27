import React, { createContext, useState, useEffect } from "react";

const Context = createContext();

function FetchData({ children }) {
  const [serverUrl, setServerUrl] = useState("");
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [urlPlayer, setUrlPlayer] = useState("");
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const url = `${serverUrl}/player_api.php?username=${username}&password=${password}`;

    const liveCategories = JSON.parse(sessionStorage.getItem("liveCategories"));
    const vodCategories = JSON.parse(sessionStorage.getItem("vodCategories"));
    const seriesCategories = JSON.parse(
      sessionStorage.getItem("seriesCategories")
    );
    if (seriesCategories && vodCategories && liveCategories) {
      return;
    }
    const fetchLiveData = async () => {
      try {
        const liveCategoriesResponse = await fetch(
          `${url}&action=get_live_categories`
        );
        const liveCategoriesData = await liveCategoriesResponse.json();
        liveCategoriesData.unshift(
          { category_id: "0", category_name: "All" },
          { category_id: "1", category_name: "Favorites" }
        );

        const fetchCountForCategory = async (category) => {
          try {
            const response = await fetch(
              `${url}&action=get_live_streams&category_id=${category.category_id}`
            );
            const data = await response.json();
            return data.length;
          } catch (error) {
            setError("Error fetching movies count for category:", error);
          }
        };

        const liveAllStreamsData = await Promise.all(
          liveCategoriesData.map(async (category) => {
            const count = await fetchCountForCategory(category);
            return { [category.category_id]: count };
          })
        );

        const liveCategoryWithCount = liveCategoriesData.map((category) => {
          const count = liveAllStreamsData.find(
            (count) => category.category_id in count
          )[category.category_id];
          return { ...category, count: count };
        });

        sessionStorage.setItem(
          "liveCategories",
          JSON.stringify(liveCategoryWithCount)
        );
      } catch (error) {
        setError(error);
      }
    };

    const fetchVodData = async () => {
      try {
        const vodCategoriesResponse = await fetch(
          `${url}&action=get_vod_categories`
        );
        const vodCategoriesData = await vodCategoriesResponse.json();
        vodCategoriesData.unshift(
          { category_id: "0", category_name: "All" },
          { category_id: "1", category_name: "Favorites" }
        );

        const fetchCountForCategory = async (category) => {
          try {
            const response = await fetch(
              `${url}&action=get_vod_streams&category_id=${category.category_id}`
            );
            const data = await response.json();
            return data.length;
          } catch (error) {
            setError("Error fetching movies count for category:", error);
          }
        };

        const vodAllStreamsData = await Promise.all(
          vodCategoriesData.map(async (category) => {
            const count = await fetchCountForCategory(category);
            return { [category.category_id]: count };
          })
        );

        const vodCategoryWithCount = vodCategoriesData.map((category) => {
          const count = vodAllStreamsData.find(
            (count) => category.category_id in count
          )[category.category_id];
          return { ...category, count: count };
        });

        sessionStorage.setItem(
          "vodCategories",
          JSON.stringify(vodCategoryWithCount)
        );
      } catch (error) {
        setError(error);
      }
    };

    const fetchSeriesData = async () => {
      try {
        const seriesCategoriesResponse = await fetch(
          `${url}&action=get_series_categories`
        );
        const seriesCategoriesData = await seriesCategoriesResponse.json();
        seriesCategoriesData.unshift(
          { category_id: "0", category_name: "All" },
          { category_id: "1", category_name: "Favorites" }
        );

        const fetchCountForCategory = async (category) => {
          try {
            const response = await fetch(
              `${url}&action=get_series&category_id=${category.category_id}`
            );
            const data = await response.json();
            return data.length;
          } catch (error) {
            setError("Error fetching movies count for category:", error);
          }
        };

        const seriesAllStreamsData = await Promise.all(
          seriesCategoriesData.map(async (category) => {
            const count = await fetchCountForCategory(category);
            return { [category.category_id]: count };
          })
        );

        const seriesCategoryWithCount = seriesCategoriesData.map((category) => {
          const count = seriesAllStreamsData.find(
            (count) => category.category_id in count
          )[category.category_id];
          return { ...category, count: count };
        });
        sessionStorage.setItem(
          "seriesCategories",
          JSON.stringify(seriesCategoryWithCount)
        );
      } catch (error) {
        setError(error);
      }
    };
    fetchLiveData();
    fetchVodData();
    fetchSeriesData();
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
