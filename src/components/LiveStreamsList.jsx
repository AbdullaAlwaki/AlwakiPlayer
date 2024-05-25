import React, { useState, useEffect,useContext } from 'react';
import { Context } from '../Util/createContext';
import Logo from '../assets/logo.png';


const LiveStreamsList = ({ categoryId }) => {
  const [liveStreams, setLiveStreams] = useState([]);
  const  { serverUrl, username, password, setUrlPlayer, setError, setLoading } = useContext(Context);
    useEffect(() => {

    const fetchData = async () => {
      const url = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams&category_id=${categoryId}`;

      const allUrl = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams`;
      const response = await fetch(allUrl);
      const allData = await response.json();
      try {
        const response = await fetch(url);
        const data = await response.json();
        setLiveStreams(data);

        //This will get All LIVE Streams
        if (categoryId === '0') {
          setLiveStreams(allData);
        }
        
      } catch (error) {
        console.error("Error fetching live streams:", error);
      }
    };
    fetchData();
  }, [categoryId, serverUrl, username, password]);
  const handleStreamClick = (streamId) => {
    setLoading(true);
    setError(null);
    setUrlPlayer(null);
    const streamUrl = `${serverUrl}/live/${username}/${password}/${streamId}.m3u8`;
    setUrlPlayer(streamUrl);
  };
  return (
    <div className="live-stream-item">
      <ul className="live-streams">
        {liveStreams.map(stream => (
          <li key={stream.stream_id} onClick={() => handleStreamClick(stream.stream_id)} className='stream-item'>
            <img src={
              stream.stream_icon
                ? `${stream.stream_icon}`
                : {Logo}
            } width="20" height="20" alt="" />
            {stream.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LiveStreamsList;
