import React, { createContext, useState, useEffect } from "react";

const Context = createContext();

function FetchData({ children }) {
  // Initialize state from localStorage if available
  const [serverUrl, setServerUrl] = useState(() => {
    return localStorage.getItem("serverUrl") || "";
  });
  const [username, setUsername] = useState(() => {
    return localStorage.getItem("username") || "";
  }); 
  const [password, setPassword] = useState(() => {
    return localStorage.getItem("password") || "";
  }); 
  const [name, setName] = useState(() => {
    return localStorage.getItem("profileName") || "";
  });
  const [error, setError] = useState("");
  const [urlPlayer, setUrlPlayer] = useState("");
  const [loading, setLoading] = useState(false);
  const [closePlayer, setClosePlayer] = useState(false);
  const [played, setPlayed] = useState(0)
  
  // Persist credentials to localStorage when they change
  useEffect(() => {
    if (serverUrl) localStorage.setItem("serverUrl", serverUrl);
    if (username) localStorage.setItem("username", username);
    if (password) localStorage.setItem("password", password);
    if (name) localStorage.setItem("profileName", name);
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
        urlPlayer,
        setUrlPlayer,
        loading,
        setLoading,
        setClosePlayer,
        closePlayer,
        played,
        setPlayed
      }}
    >
      {children}
    </Context.Provider>
  );
}

export { Context, FetchData };
