// CategoriesList.jsx
import {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { Context } from "../../Util/createContext";
import ListDivision from "../ListDivision";
import { useLocation, useNavigate } from "react-router-dom";
import ImageWithFallback from "./ImageWithFallback";
import "./List.scss";
import useCategoriesKeyHandler from "./useCategoriesKeyHandler";
import useDefaultCategoryEffect from "./useDefaultCategoryEffect";
import useFetchCategory from "./useFetchCategory";
import useStoredCategories from "./useStoredCategories";
import useCategoriesLoader from "./useCategoriesLoader";

const DEFAULT_CATEGORY_ID = "2";

const CategoriesList = () => {
  const { serverUrl, username, password, setError, setLoading } =
    useContext(Context);
  const location = useLocation();
  const navigate = useNavigate();
  const isMovie = location.pathname.startsWith("/movie");

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORY_ID);

  const [focusedCategoryIndex, setFocusedCategoryIndex] = useState(0);
  const [focusedItemIndex, setFocusedItemIndex] = useState(0);

  const [isFocused, setIsFocused] = useState(1); // 0 = left menu, 1 = categories, 2 = items
  const [listItems, setListItems] = useState([]);
  const [favoriteList, setFavoriteList] = useState(() => {
    try {
      const raw = localStorage.getItem(
        isMovie ? "favoriteListMovies" : "favoriteListSeries"
      );
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn("Failed to parse favorite list:", err);
      return [];
    }
  });

  const dataListRef = useRef(null);
  const listItemRefs = useRef([]);
  const listCache = useRef({});
  const fetchCategoryRef = useRef(null);

  useEffect(() => {
    const syncFavoriteList = () => {
      try {
        const raw = localStorage.getItem(
          isMovie ? "favoriteListMovies" : "favoriteListSeries"
        );
        setFavoriteList(raw ? JSON.parse(raw) : []);
      } catch (err) {
        console.warn("Failed to sync favorite list:", err);
      }
    };

    syncFavoriteList();
    window.addEventListener("storage", syncFavoriteList);
    window.addEventListener("favorites-updated", syncFavoriteList);

    return () => {
      window.removeEventListener("storage", syncFavoriteList);
      window.removeEventListener("favorites-updated", syncFavoriteList);
    };
  }, [isMovie]);

  const storedCategories = useStoredCategories(isMovie);

  useCategoriesLoader({
    storedCategories,
    favoriteList,
    setCategories,
    setLoading,
    serverUrl,
    username,
    password,
    setError,
    isMovie,
  });

  const fetchCategory = useFetchCategory({
    setSelectedCategory,
    setFocusedItemIndex,
    setIsFocused,
    listCache,
    setListItems,
    favoriteList,
    isMovie,
    serverUrl,
    username,
    password,
    setError,
  });

  useEffect(() => {
    fetchCategoryRef.current = fetchCategory;
  }, [fetchCategory]);

  const handleCategorySelect = useCallback((categoryId) => {
    fetchCategoryRef.current?.(categoryId);
  }, []);

  const handleItemOpen = useCallback(
    (item) => {
      if (isMovie) {
        navigate(`/movies/m${item.stream_id}`);
      } else {
        navigate(`/series/s${item.series_id}`);
      }
    },
    [isMovie, navigate]
  );

  const handleItemHover = useCallback((idx) => {
    setFocusedItemIndex(idx);
    setIsFocused(2);
  }, [setFocusedItemIndex, setIsFocused]);

  useEffect(() => {
    if (isFocused !== 2 || focusedItemIndex < 0 || !listItems.length) return;

    const itemNode = listItemRefs.current[focusedItemIndex];
    const container = dataListRef.current;

    if (!itemNode || !container) return;

    const frame = window.requestAnimationFrame(() => {
      const itemTop = itemNode.offsetTop;
      const itemHeight = itemNode.offsetHeight;
      const containerHeight = container.clientHeight;
      const currentTop = container.scrollTop;
      const targetTop = Math.min(
        Math.max(itemTop - containerHeight / 2 + itemHeight / 2, 0),
        container.scrollHeight - containerHeight
      );

      if (Math.abs(currentTop - targetTop) > 1) {
        container.scrollTo({ top: targetTop, behavior: "auto" });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isFocused, focusedItemIndex, listItems]);

  useEffect(() => {
    listItemRefs.current.length = listItems.length;
  }, [listItems]);

  // تحميل التصنيف الافتراضي (ID=2) عند تحميل المكون لأول مرة
  useDefaultCategoryEffect(categories, setFocusedCategoryIndex, fetchCategoryRef);

  const handleKey = useCategoriesKeyHandler({
    categories,
    focusedCategoryIndex,
    setFocusedCategoryIndex,
    focusedItemIndex,
    setFocusedItemIndex,
    isFocused,
    setIsFocused,
    listItems,
    isMovie,
    navigate,
    fetchCategoryRef,
  });

  useEffect(() => {
    document.addEventListener("keydown", handleKey, true);
    return () => document.removeEventListener("keydown", handleKey, true);
  }, [handleKey]);

  return (
    <>
      <ListDivision isFocused={isFocused === 0} />

      <div className="categories_container">
        <div className="categories_list_container">
          <ul className="categories">
            {categories?.map((category, index) => (
              <li
                key={category.category_id}
                className={`category ${
                  focusedCategoryIndex === index && isFocused === 1
                    ? "focused"
                    : ""
                } ${
                  selectedCategory === category.category_id ? "selected" : ""
                }`}
                onClick={() => handleCategorySelect(category.category_id)}
              >
                <h1 className="category-name">
                  {category.category_name}
                  {category.count !== undefined && (
                    <span className="category-count">{category.count}</span>
                  )}
                </h1>
              </li>
            ))}
          </ul>
        </div>

        <div className="data_list" ref={dataListRef}>
          <ul className="list">
            {listItems.map((item, idx) => (
              <li
                ref={(el) => (listItemRefs.current[idx] = el)}
                key={item.series_id || item.stream_id || idx}
                className={`categorie ${
                  focusedItemIndex === idx && isFocused === 2 ? "focused" : ""
                }`}
                onClick={() => handleItemOpen(item)}
                onMouseEnter={() => handleItemHover(idx)}
              >
                <ImageWithFallback
                  src={`${item.cover || item.stream_icon}`}
                  alt={item.name || item.title}
                  rootRef={dataListRef}
                />
                <span className="name">{item.name || item.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default CategoriesList;