// CategoriesList.jsx
import {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Context } from "../../Util/createContext";
import { fetchData } from "../../Util/helperfunction";
import ListDivision from "../ListDivision";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import "./List.scss";

const CategoriesList = () => {
  const { serverUrl, username, password, setError, setLoading } =
    useContext(Context);
  const location = useLocation();
  const navigate = useNavigate();
  const isMovie = location.pathname.startsWith("/movie");

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [listItems, setListItems] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(1);
  const [loadLimit, setLoadLimit] = useState(20);

  const dataListRef = useRef(null);
  const itemRefs = useRef([]);
  const listRef = useRef(null);
  const listCache = useRef({});
  const loadingRef = useRef(null);

  const favoriteList = useMemo(
    () =>
      JSON.parse(
        localStorage.getItem(
          isMovie ? "favoriteListMovies" : "favoriteListSeries"
        )
      ) || [],
    [isMovie]
  );

  const storedCategories = useMemo(
    () =>
      JSON.parse(
        sessionStorage.getItem(isMovie ? "movieCategories" : "seriesCategories")
      ),
    [isMovie]
  );

  const displayList = useMemo(() => {
    return listItems.slice(0, loadLimit);
  }, [listItems, loadLimit]);

  useEffect(() => {
    if (storedCategories) {
      const updatedCategories = storedCategories.map((c) =>
        c.category_id === "1" ? { ...c, count: favoriteList.length } : c
      );
      setCategories(updatedCategories);
    } else {
      fetchData(
        setLoading,
        serverUrl,
        username,
        password,
        (data) => {
          const updatedData = data.map((c) =>
            c.category_id === "1" ? { ...c, count: favoriteList.length } : c
          );
          setCategories(updatedData);
          sessionStorage.setItem(
            isMovie ? "movieCategories" : "seriesCategories",
            JSON.stringify(updatedData)
          );
        },
        setError,
        isMovie ? "vod" : "series",
        isMovie ? "vod_streams" : "series"
      );
    }
  }, [
    storedCategories,
    favoriteList.length,
    serverUrl,
    username,
    password,
    setLoading,
    setError,
    isMovie,
  ]);

  const fetchCategory = useCallback(
    async (id) => {
      setSelectedCategory(id);
      setFocusedIndex(0);
      setIsFocused(2);

      if (listCache.current[id]) {
        setListItems(listCache.current[id]);
        setLoadLimit(20);
        return;
      }

      if (id === "1") {
        setListItems(favoriteList);
        return;
      }

      const action = isMovie ? "get_vod_streams" : "get_series";
      const catId = id === "2" ? 0 : id;

      try {
        const data = await (
          await fetch(
            `${serverUrl}/player_api.php?username=${username}&password=${password}&action=${action}&category_id=${catId}&sort_by=added&sort_dir=desc`
          )
        ).json();

        console.log(id);

        const filteredData =
          id === "2"
            ? data
                .sort((a, b) => {
                  const dateA = parseFloat(a.added);
                  const dateB = parseFloat(b.added);
                  return dateB - dateA;
                })
                .slice(0, 30)
            : data;
        setListItems(filteredData);
        listCache.current[id] = filteredData;
        setLoadLimit(20);
      } catch (err) {
        setError("Error fetching list: " + err.message);
      }
    },
    [serverUrl, username, password, setError, favoriteList, isMovie]
  );

  const handleKey = useCallback(
    (e) => {
      if (
        ![
          "ArrowDown",
          "ArrowUp",
          "ArrowLeft",
          "ArrowRight",
          "Enter",
          "Backspace",
        ].includes(e.key)
      )
        return;
      e.preventDefault();

      if (isFocused === 1) {
        switch (e.key) {
          case "ArrowDown":
            setFocusedIndex((i) => Math.min(i + 1, categories.length - 1));
            break;
          case "ArrowUp":
            setFocusedIndex((i) => Math.max(i - 1, 0));
            break;
          case "Enter":
            fetchCategory(categories[focusedIndex]?.category_id);
            break;
          case "ArrowLeft":
            setIsFocused(0);
            break;
          case "ArrowRight":
            setIsFocused(2);
            break;
        }
      } else if (isFocused === 2) {
        switch (e.key) {
          case "Backspace":
            setIsFocused(1);
            break; // Removed setClose(false)
          case "ArrowDown":
            setFocusedIndex((i) => Math.min(i + 5, displayList.length - 1));
            break;
          case "ArrowUp":
            setFocusedIndex((i) => Math.max(i - 5, 0));
            break;
          case "ArrowLeft":
            if (focusedIndex % 5 === 0) {
              setIsFocused(1);
            } else {
              setFocusedIndex((i) => i - 1);
            }
            break;
          case "ArrowRight":
            setFocusedIndex((i) => Math.min(i + 1, displayList.length - 1));
            break;
          case "Enter":
            if (displayList[focusedIndex]) {
              const item = displayList[focusedIndex];
              if (isMovie) {
                navigate(`/movies/m${item.stream_id}`);
              } else {
                navigate(`/series/s${item.series_id}`);
              }
            }
            break;
        }
      } else if (isFocused === 0) {
        switch (e.key) {
          case "ArrowRight":
            setIsFocused(1);
            break;
        }
      }

      if (listRef.current) {
        const element = listRef.current.children[focusedIndex];
        if (element) {
          element.scrollIntoView({ block: "nearest", behavior: "auto" });
        }
      }
    },
    [
      categories,
      focusedIndex,
      isFocused,
      selectedCategory,
      fetchCategory,
      displayList,
      isMovie,
      navigate,
    ]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey, true);
    return () => document.removeEventListener("keydown", handleKey, true);
  }, [handleKey]);

  useEffect(() => {
    if (isFocused === 1 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex].scrollIntoView({
        block: "nearest",
        behavior: "auto",
      });
    }
  }, [focusedIndex, isFocused]);

  useEffect(() => {
    if (loadingRef.current && displayList.length < listItems.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setLoadLimit((prev) => Math.min(prev + 20, listItems.length));
          }
        },
        { threshold: 1.0 }
      );
      observer.observe(loadingRef.current);
      return () => observer.disconnect();
    }
  }, [displayList, listItems.length]);

  return (
    <>
      <ListDivision isFocused={isFocused === 0} />

      <div
        className="categories_container"
        role="region"
        aria-label="Categories"
      >
        <div className="categories_list_container">
          <ul className="categories" role="listbox">
            {categories?.map((category, index) => (
              <li
                key={category.category_id}
                ref={(el) => (itemRefs.current[index] = el)}
                className={`category ${
                  focusedIndex === index && isFocused === 1 ? "focused" : ""
                } ${
                  selectedCategory === category.category_id ? "selected" : ""
                }`}
                onClick={() => fetchCategory(category.category_id)}
                role="option"
                aria-selected={selectedCategory === category.category_id}
              >
                <h1 className="category-name">
                  {category.category_name}
                  {category.count !== undefined && (
                    <span
                      className="category-count"
                      aria-label={`${category.count} items`}
                    >
                      {category.count}
                    </span>
                  )}
                </h1>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="data_list"
          role="region"
          aria-label="Items List"
          ref={dataListRef}
        >
          <ul ref={listRef} className="list">
            {displayList.map((item, idx) => (
              <li
                key={item.series_id || item.stream_id || idx}
                className={`categorie ${
                  focusedIndex === idx && isFocused === 2 ? "focused" : ""
                }`}
                onClick={() => {
                  if (isMovie) {
                    navigate(`/movies/m${item.stream_id}`);
                  } else {
                    navigate(`/series/s${item.series_id}`);
                  }
                }}
                role="option"
                aria-selected={focusedIndex === idx && isFocused === 2}
                onMouseEnter={() => {
                  setFocusedIndex(idx);
                  setIsFocused(2);
                }}
              >
                <img
                  src={`${
                    item.cover || item.stream_icon
                      ? item.cover || item.stream_icon
                      : logo
                  }?w=200&h=300`}
                  alt={item.name || item.title}
                />

                <span className="name">{item.name || item.title}</span>
              </li>
            ))}

            {displayList.length < listItems.length && (
              <li ref={loadingRef} className="loading-indicator">
                جاري التحميل...
              </li>
            )}

            {listItems.length === 0 && (
              <li className="no-items">لا توجد عناصر في هذه الفئة</li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default CategoriesList;
