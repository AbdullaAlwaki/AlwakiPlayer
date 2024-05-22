import React, { useEffect, useState } from 'react';
import Login from './Login';

import '../Style/Home.scss';
import { useNavigate } from 'react-router-dom';


export default function Home() {
    const [data , setData] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        const localStor = JSON.parse(localStorage.getItem('user'));
        
        setData(localStor);
    }, []);   
    
    if (data === null) {
        return (
            <div>
                <Login />
            </div>
        )
    }

  return (
    <div className="iptv-container">
      <div>
        <h1>Welcome to IPTV</h1>
        <div>
            <h2>Hi {data.name}</h2>
        </div>

        <div>
            <h2>Choose your favorite</h2>
        </div>
      </div>

      <div className="iptv_container_img_live" onClick={() => navigate('/live')}>
      </div>

       <div className="iptv_container_img_series" onClick={() => navigate('/series')}>
       </div>

      <div className="iptv_container_img_movies" onClick={() => navigate('/movies')}>
      </div>

    </div>
    
  )
}
