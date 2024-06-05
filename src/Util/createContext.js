import React, { createContext, useState } from "react";

const Context = createContext();

function FetchData({ children }) {
  const [serverUrl, setServerUrl] = useState("");
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [urlPlayer, setUrlPlayer] = useState("");
  const [loading, setLoading] = useState(false);
  const [closePlayer, setClosePlayer] = useState(false);
  const [played, setPlayed] = useState(0)
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
