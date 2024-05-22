import React, { useContext } from 'react'
import { Context } from '../Util/createContext';

import '../Style/Login.scss';

export default function Login() {
    const { setServerUrl,
            setUsername,
            setPassword,
            setName,
            serverUrl,
            username,
            password,
            name,
            error,
            setError,
          } = useContext(Context);

  return (
    <div className="login-container">
      <div>
        <input type="text" id="name" onChange={(e) => setName(e.target.value)} placeholder="Name" />
      </div>
      <div>
        <input type="text" id="serverUrl" onChange={(e) => setServerUrl(e.target.value)} placeholder="http://yourserver.com:port" />
      </div>
      <div>
        <input type="text" id="username" onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
      </div>
      <div>
        <input type="password" id="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      </div>

      <div>
        <button onClick={() => { localStorage.setItem('user', JSON.stringify({
                        serverUrl,
                        username,
                        password,
                        name,
                }));
                setError(null);
                window.location.reload();
                }}>
            Save Login
        </button>
      </div>

    {error && <div>{error}</div>}

    </div>
  )
}
