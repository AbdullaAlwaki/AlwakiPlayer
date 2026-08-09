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

const getStoredCategoryState = (isMovie) => {
  try {
    const raw = sessionStorage.getItem(
      isMovie ? "movieCategoryState" : "seriesCategoryState"
    );

    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (err) {
    console.warn("Failed to parse stored category state:", err);
    return null;
  }
};

const CategoriesList = () => {
  const { serverUrl, username, password, setError, setLoading } =
    useContext(Context);
  const location = useLocation();
  const navigate = useNavigate();
  const isMovie = location.pathname.startsWith("/movie");
  const categoryStateKey = isMovie ? "movieCategoryState" : "seriesCategoryState";

  const savedState = getStoredCategoryState(isMovie);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    savedState?.selectedCategory || DEFAULT_CATEGORY_ID
  );

  const [focusedCategoryIndex, setFocusedCategoryIndex] = useState(0);
  const [focusedItemIndex, setFocusedItemIndex] = useState(
    savedState?.focusedItemIndex || 0
  );
  const [selectedItemId, setSelectedItemId] = useState(
    savedState?.selectedItemId || null
  );
  const [scrollTop, setScrollTop] = useState(savedState?.scrollTop || 0);

  const [isFocused, setIsFocused] = useState(1); // 0 = left menu, 1 = categories, 2 = items
  const [listItems, setListItems] = useState(savedState?.listItems || []);

  useEffect(() => {
    const nextState = getStoredCategoryState(isMovie);
    setSelectedCategory(nextState?.selectedCategory || DEFAULT_CATEGORY_ID);
    setFocusedItemIndex(nextState?.focusedItemIndex || 0);
    setSelectedItemId(nextState?.selectedItemId || null);
    setScrollTop(nextState?.scrollTop || 0);
    setIsFocused(1);
    setListItems(nextState?.listItems || []);
    setCategories([]);
  }, [isMovie]);
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
    setSelectedItemId(null);
    setIsFocused(2);
    fetchCategoryRef.current?.(categoryId);
  }, []);

  const handleItemOpen = useCallback(
    (item) => {
      const itemId = isMovie ? item.stream_id : item.series_id;
      setSelectedItemId(itemId);

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

  useEffect(() => {
    const container = dataListRef.current;
    if (!container || !listItems.length) return;

    if (Math.abs(container.scrollTop - scrollTop) > 1) {
      container.scrollTop = scrollTop;
    }
  }, [listItems, scrollTop]);

  useEffect(() => {
    const container = dataListRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [listItems]);

  useEffect(() => {
    if (!listItems.length) return;

    if (selectedItemId) {
      const nextIndex = listItems.findIndex((item) => {
        const itemId = isMovie ? item.stream_id : item.series_id;
        return itemId === selectedItemId;
      });

      if (nextIndex >= 0) {
        setFocusedItemIndex(nextIndex);
        setIsFocused(2);
      }
    }
  }, [isMovie, listItems, selectedItemId]);

  useEffect(() => {
    if (!selectedCategory && !listItems.length) return;

    const stateToSave = {
      selectedCategory,
      focusedItemIndex,
      selectedItemId,
      listItems,
      scrollTop,
    };

    sessionStorage.setItem(categoryStateKey, JSON.stringify(stateToSave));
  }, [categoryStateKey, focusedItemIndex, listItems, scrollTop, selectedCategory, selectedItemId]);

  // Restore the last selected category on revisit instead of reloading default data.
  useDefaultCategoryEffect({
    categories,
    selectedCategory,
    setFocusedCategoryIndex,
    fetchCategoryRef,
    listItems,
    setListItems,
  });

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