// CategoriesList.jsx
import {
  useState,
  useEffect,
  useContext,
  useRef,
  useMemo,
} from "react";
import { Context } from "../../Util/createContext";
import ListDivision from "../ListDivision";
import { useLocation, useNavigate } from "react-router-dom";
import ImageWithFallback from "./ImageWithFallback";
import "./List.scss";
import useCategoriesKeyHandler from "./useCategoriesKeyHandler";
import usePreloadImages from "./usePreloadImages";
import useDefaultCategoryEffect from "./useDefaultCategoryEffect";
import useFetchCategory from "./useFetchCategory";
import useStoredCategories from "./useStoredCategories";
import useCategoriesLoader from "./useCategoriesLoader";

const CategoriesList = () => {
  const { serverUrl, username, password, setError, setLoading } =
    useContext(Context);
  const location = useLocation();
  const navigate = useNavigate();
  const isMovie = location.pathname.startsWith("/movie");

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("2"); // تغيير القيمة الافتراضية إلى 2

  const [focusedCategoryIndex, setFocusedCategoryIndex] = useState(0);
  const [focusedItemIndex, setFocusedItemIndex] = useState(0);

  const [isFocused, setIsFocused] = useState(1); // 0 = left menu, 1 = categories, 2 = items
  const [listItems, setListItems] = useState([]);

  const dataListRef = useRef(null);
  const catRefs = useRef([]);
  const listRef = useRef(null);
  const listCache = useRef({});
  
  // إنشاء ref لتخزين مرجع إلى fetchCategory
  const fetchCategoryRef = useRef(null);

  const favoriteList = useMemo(
    () =>
      JSON.parse(
        localStorage.getItem(
          isMovie ? "favoriteListMovies" : "favoriteListSeries"
        )
      ) || [],
    [isMovie]
  );

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

  // تحديث المرجع في كل مرة تتغير فيها fetchCategory
  useEffect(() => {
    fetchCategoryRef.current = fetchCategory;
  }, [fetchCategory]);

  // تحميل التصنيف الافتراضي (ID=2) عند تحميل المكون لأول مرة
  useDefaultCategoryEffect(categories, setFocusedCategoryIndex, fetchCategoryRef);

  // تحسين Preloading للصور - تحميل تدريجي
  usePreloadImages(listItems);

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
    dataListRef,
    listRef,
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
                ref={(el) => (catRefs.current[index] = el)}
                className={`category ${
                  focusedCategoryIndex === index && isFocused === 1
                    ? "focused"
                    : ""
                } ${
                  selectedCategory === category.category_id ? "selected" : ""
                }`}
                onClick={() => fetchCategoryRef.current(category.category_id)}
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
          <ul ref={listRef} className="list">
            {listItems.map((item, idx) => (
              <li
                key={item.series_id || item.stream_id || idx}
                className={`categorie ${
                  focusedItemIndex === idx && isFocused === 2 ? "focused" : ""
                }`}
                onClick={() => {
                  if (isMovie) {
                    navigate(`/movies/m${item.stream_id}`);
                  } else {
                    navigate(`/series/s${item.series_id}`);
                  }
                }}
                onMouseEnter={() => {
                  setFocusedItemIndex(idx);
                  setIsFocused(2);
                }}
              >
                <ImageWithFallback
                  src={`${item.cover || item.stream_icon}`}
                  alt={item.name || item.title}
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