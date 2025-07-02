import { useEffect, useCallback, useState } from 'react';

export const useAirPlay = (videoRef) => {
  const [isAirPlayAvailable, setIsAirPlayAvailable] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const checkAirPlayAvailability = () => {
      if (video.webkitShowPlaybackTargetPicker) {
        setIsAirPlayAvailable(true);
      }
    };

    checkAirPlayAvailability();
  }, [videoRef]);

  const handleAirPlay = useCallback(() => {
    const video = videoRef.current;
    if (video?.webkitShowPlaybackTargetPicker) {
      video.webkitShowPlaybackTargetPicker();
    }
  }, [videoRef]);

  return {
    isAirPlayAvailable,
    handleAirPlay
  };
};
