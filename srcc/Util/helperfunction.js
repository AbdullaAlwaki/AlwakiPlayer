const fetchData = async (
    setLoading,
    serverUrl,
    username,
    password,
    setCategories,
    setError,
    type,
    get
) => {
    setLoading(true);
    try {
      const CategoriesResponse = await fetch(
        `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_${type}_categories`
      );
      const CategoriesData = await CategoriesResponse.json();
      CategoriesData.unshift(
        { category_id: "0", category_name: "All" },
        { category_id: "1", category_name: "Favorites" },
        { category_id: "2", category_name: "Recently Add" },
        { category_id: "3", category_name: "continue watching" },

      );
      setCategories(CategoriesData);

       const fetchCountForCategory = async (category) => {
         try {
           const response = await fetch(
             `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_${get}&category_id=${category.category_id}`
           );
           const data = await response.json();
           return data.length;
         } catch (error) {
           setError(`Error fetching ${type} count for category:`, error);
         }
       };

       const AllStreamsData = await Promise.all(
        CategoriesData.map(async (category) => {
          const count = await fetchCountForCategory(category);
          return { [category.category_id]: count };
        })
      ); 

       const CategoryWithCount = CategoriesData.map((category) => {
         const count =AllStreamsData.find(
           (count) => category.category_id in count
         )[category.category_id];
         return { ...category, count: count };
       });

      sessionStorage.setItem(
        `${type}Categories`,
        JSON.stringify(CategoryWithCount)
      );
    } catch (error) {
      setError(error);
    }finally {
      setLoading(false);
    }
  };

  const inFavorite = (stream, favoriteList) => {
    const isIn = favoriteList.some(
      (item) => item.stream_id === stream.stream_id
    );
    if (isIn) {
      return true;
    } else {
      return false;
    }
  };

  const handelFavorite = async (stream, live, favoriteList) => {
    let streamIndex = favoriteList.findIndex(
      (item) => item.stream_id === stream.stream_id
    );

    if (streamIndex !== -1) {
      favoriteList.splice(streamIndex, 1);
    } else {
      favoriteList.push(stream);
    }
    localStorage.setItem(`favoriteList${live}`, JSON.stringify(favoriteList));
  };

export {fetchData, inFavorite, handelFavorite}