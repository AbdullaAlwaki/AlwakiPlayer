import React, { createContext, useState, useEffect} from 'react';


const Context = createContext();

function FetchData({ children }) {
    const [serverUrl, setServerUrl] = useState('');//
    const [username, setUsername] = useState('');//
    const [password, setPassword] = useState('');//
    const [name, setName] = useState('');
    const [error, setError] = useState(null);
    const [liveCategories, setLiveCategories] = useState([]);
    const [urlPlayer, setUrlPlayer] = useState('');
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
      const fetchData = async () => {
          const url = `${serverUrl}/player_api.php?username=${username}&password=${password}`;
          if (localStorage.getItem('user') === null) {
            setError('Please enter all fields');
              return;
          } else {
            try {
              const userInfoResponse = await fetch(`${url}&action=user_info`);
              const userInfoData = await userInfoResponse.json();
              setUserInfo(userInfoData);
              const liveCategoriesResponse = await fetch(`${url}&action=get_live_categories`);
              const liveCategoriesData = await liveCategoriesResponse.json();
              setLiveCategories(liveCategoriesData);
          } catch (error) {
              console.error("Error fetching data:", error);
              setError(error);
          }
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
        setUserInfo
      }}
    >
      {children}
    </Context.Provider>
  )
}

export { Context, FetchData };
