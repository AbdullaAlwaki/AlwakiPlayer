import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IconTv from '../assets/icon-tv.svg';
import IconMovie from '../assets/icon-movie.svg';
import IconSeries from '../assets/icon-series.svg';
import Logo from '../assets/logo.png';
import '../Style/ListDivision.scss';

const ListDivision = () => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(true);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isFocused) {
        switch (event.key) {
          case 'ArrowDown':
            handleArrowDown();
            break;
          case 'ArrowUp':
            handleArrowUp();
            break;
          case 'Enter':
            handleEnter();
            break;
          case 'ArrowRight':
            setIsFocused(false);
            break;
          default:
            break;
        }
      } else {
        if (event.key === 'ArrowLeft') {
          handleArrowLeft();
        }
      }
    };

    const handleArrowDown = () => {
      if (selectedIndex < 4) {
        setSelectedIndex(selectedIndex + 1);
      }
    };

    const handleArrowUp = () => {
      if (selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
      }
    };

    const handleArrowLeft = () => {
      setIsFocused(true);
    };

    const handleEnter = () => {
      if (selectedIndex === 0) {
        navigate('/');
      } else if (selectedIndex === 1) {
        navigate('/live');
      } else if (selectedIndex === 2) {
        navigate('/movies');
      } else if (selectedIndex === 3) {
        navigate('/series');
      } else if (selectedIndex === 4) {
        handleLogout();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIndex, navigate, isFocused]);

  const handleClick = (index) => {
    setSelectedIndex(index);
    if (index === 0) {
      navigate('/');
    } else if (index === 1) {
      navigate('/live');
    } else if (index === 2) {
      navigate('/movies');
    } else if (index === 3) {
      navigate('/series');
    } else if (index === 4) {
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className="list-division">
      <div
        className={`division ${selectedIndex === 0 && isFocused ? 'selected' : ''}`}
        onClick={() => handleClick(0)}
      >
        <img src={Logo} alt="Logo" />
      </div>
      <div
        className={`division ${selectedIndex === 1 && isFocused ? 'selected' : ''}`}
        onClick={() => handleClick(1)}
      >
        <img src={IconTv} alt="Live TV Icon" />
        <span>Live TV</span>
      </div>
      <div
        className={`division ${selectedIndex === 2 && isFocused ? 'selected' : ''}`}
        onClick={() => handleClick(2)}
      >
        <img src={IconMovie} alt="Movie Icon" />
        <span>Movies</span>
      </div>
      <div
        className={`division ${selectedIndex === 3 && isFocused ? 'selected' : ''}`}
        onClick={() => handleClick(3)}
      >
        <img src={IconSeries} alt="Series Icon" />
        <span>Series</span>
      </div>
      <div
        className={`division ${selectedIndex === 4 && isFocused ? 'selected' : ''}`}
        onClick={() => handleClick(4)}
      >
        <span>Logout</span>
      </div>
    </div>
  );
};

export default ListDivision;
