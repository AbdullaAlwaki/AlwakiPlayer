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

// مكون صورة مع دعم للـ fallback عند فشل التحميل
const ImageWithFallback = ({ src, alt, onError: customOnError }) => {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  
  useEffect(() => {
    // عند تغيير مصدر الصورة، نعيد تعيين حالة الخطأ
    setHasError(false);
    setCurrentSrc(src);
  }, [src]);

  const handleError = useCallback(() => {
    setHasError(true);
    if (customOnError) {
      customOnError();
    }
  }, [customOnError]);

  return (
    <img
      src={hasError ? logo : currentSrc}
      alt={alt}
      loading="eager"
      onError={handleError}
    />
  );
};

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

  const storedCategories = useMemo(
    () =>
      JSON.parse(
        sessionStorage.getItem(isMovie ? "movieCategories" : "seriesCategories")
      ),
    [isMovie]
  );

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

  // تعريف fetchCategory باستخدام useCallback
  const fetchCategory = useCallback(
    async (id) => {
      setSelectedCategory(id);
      setFocusedItemIndex(0);
      setIsFocused(2);

      if (listCache.current[id]) {
        setListItems(listCache.current[id]);
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

        const filteredData =
          id === "2"
            ? data
                .sort((a, b) => parseFloat(b.added) - parseFloat(a.added))
                .slice(0, 30)
            : data;

        setListItems(filteredData);
        listCache.current[id] = filteredData;
      } catch (err) {
        setError("Error fetching list: " + err.message);
      }
    },
    [serverUrl, username, password, setError, favoriteList, isMovie]
  );

  // تحديث المرجع في كل مرة تتغير فيها fetchCategory
  useEffect(() => {
    fetchCategoryRef.current = fetchCategory;
  }, [fetchCategory]);

  // تحميل التصنيف الافتراضي (ID=2) عند تحميل المكون لأول مرة
  useEffect(() => {
    if (categories.length > 0) {
      // البحث عن فهرس التصنيف ذو الـ ID=2
      const index = categories.findIndex(c => c.category_id === "2");
      
      if (index !== -1) {
        setFocusedCategoryIndex(index);
        fetchCategoryRef.current("2");
      } else {
        // إذا لم يكن موجودًا، نستخدم التصنيف الأول
        setFocusedCategoryIndex(0);
        fetchCategoryRef.current(categories[0]?.category_id);
      }
    }
  }, [categories]);

  // تحسين Preloading للصور - تحميل تدريجي
  useEffect(() => {
    const preloadImage = (src) => {
      return new Promise((resolve) => {
        if (!src) {
          resolve();
          return;
        }
        
        const img = new Image();
        img.src = `${src}?w=200&h=300`;
        img.onload = resolve;
        img.onerror = resolve; // لا ننتظر وقتًا طويلًا للفشل
      });
    };

    const loadImagesSequentially = async () => {
      const batchSize = 5;
      let index = 0;
      
      while (index < listItems.length) {
        const batch = listItems.slice(index, index + batchSize);
        await Promise.all(
          batch.map((item) => {
            const src = item.cover || item.stream_icon;
            return src ? preloadImage(src) : Promise.resolve();
          })
        );
        index += batchSize;
        
        // إعطاء فرصة للمتصفح لمعالجة الواجهة
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    };

    if (listItems.length > 0) {
      loadImagesSequentially();
    }
  }, [listItems]);

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
            setFocusedCategoryIndex((i) =>
              Math.min(i + 1, categories.length - 1)
            );
            break;
          case "ArrowUp":
            setFocusedCategoryIndex((i) => Math.max(i - 1, 0));
            break;
          case "Enter":
            fetchCategoryRef.current(categories[focusedCategoryIndex]?.category_id);
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
            break;
          case "ArrowDown":
            setFocusedItemIndex((i) =>
              Math.min(i + 5, listItems.length - 1)
            );
            break;
          case "ArrowUp":
            setFocusedItemIndex((i) => Math.max(i - 5, 0));
            break;
          case "ArrowLeft":
            if (focusedItemIndex % 5 === 0) {
              setIsFocused(1);
            } else {
              setFocusedItemIndex((i) => i - 1);
            }
            break;
          case "ArrowRight":
            setFocusedItemIndex((i) =>
              Math.min(i + 1, listItems.length - 1)
            );
            break;
          case "Enter":
            if (listItems[focusedItemIndex]) {
              const item = listItems[focusedItemIndex];
              if (isMovie) {
                navigate(`/movies/m${item.stream_id}`);
              } else {
                navigate(`/series/s${item.series_id}`);
              }
            }
            break;
        }
      } else if (isFocused === 0) {
        if (e.key === "ArrowRight") {
          setIsFocused(1);
        }
      }

      // تحسين التمرير
      if (isFocused === 2 && listRef.current) {
        const itemsPerRow = 5;
        const currentRow = Math.floor(focusedItemIndex / itemsPerRow);
        const visibleRows = 3; // عدد الصفوف المرئية في الشاشة
        
        const containerHeight = dataListRef.current?.clientHeight || 0;
        const itemHeight = 250; // ارتفاع العنصر تقريباً
        const totalVisibleHeight = itemHeight * visibleRows;
        
        const scrollPosition = dataListRef.current?.scrollTop || 0;
        const itemTopPosition = focusedItemIndex * (itemHeight / itemsPerRow);
        
        // إذا كان العنصر خارج النطاق المرئي، قم بالتمرير
        if (itemTopPosition < scrollPosition || 
            itemTopPosition > scrollPosition + totalVisibleHeight - itemHeight) {
          dataListRef.current?.scrollTo({
            top: itemTopPosition - (totalVisibleHeight / 2),
            behavior: 'smooth'
          });
        }
      }
    },
    [
      categories,
      focusedCategoryIndex,
      focusedItemIndex,
      isFocused,
      listItems,
      isMovie,
      navigate,
    ]
  );

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