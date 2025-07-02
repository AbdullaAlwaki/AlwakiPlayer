import { useState, useCallback, useEffect } from 'react';

export const useVideoControls = (videoRef) => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          if (err.name !== 'AbortError') {
            console.log('Error playing:', err);
          }
        });
      }
    } else {
      video.pause();
    }
    setPlaying(!video.paused);
  }, [videoRef]);

  const handleFullscreen = useCallback(() => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, [videoRef]);

  const handleVolumeChange = useCallback((newVolume) => {
    const video = videoRef.current;
    if (!video) return;

    setVolume(newVolume);
    video.volume = newVolume;
    setIsMuted(newVolume === 0);
  }, [videoRef]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !isMuted;
    setIsMuted(newMuted);
    video.muted = newMuted;
    if (!newMuted && volume === 0) {
      handleVolumeChange(1);
    }
  }, [videoRef, isMuted, volume, handleVolumeChange]);

  // Add effect to update fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return {
    playing,
    volume,
    isMuted,
    isFullscreen,
    currentTime,
    showControls,
    togglePlay,
    handleFullscreen,
    handleVolumeChange,
    toggleMute,
    setShowControls,
    setCurrentTime
  };
};
