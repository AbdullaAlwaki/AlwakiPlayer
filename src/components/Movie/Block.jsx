import React from "react";

function Block({
  focusedIndex,
  seriesCategories,
  SeriesList= null,
  MovieList= null,
  isFocused,
  selectedCategory,
  handleCategoryClick,
  seriesList,
  seriesDataListRef,
  itemRefs,
  close
}) {
  return (
    <>
     {SeriesList ? ( 
    <div className="series_categories_container" role="region" aria-label="Series Categories">
        <div className="series_categories_list_container">
          <ul className="series_categories" role="listbox" aria-activedescendant={`series-category-${focusedIndex}`} tabIndex="0">
            {seriesCategories?.map((category, index) => (
              <li
                ref={el => (itemRefs.current[index] = el)}
                className={`series_category ${
                  focusedIndex === index && isFocused === 1 ? "focused" : ""
                } ${selectedCategory === category.category_id ? "selected" : ""}`}
                key={category.category_id}
                onClick={() => handleCategoryClick(category.category_id)}
                role="option"
                aria-selected={selectedCategory === category.category_id}
                id={`series-category-${index}`}
                tabIndex={focusedIndex === index && isFocused === 1 ? 0 : -1}
              >
                <h1 className="category-name">
                  {category.category_name}
                  <span className="category-count" aria-label={`${category.count} items`}>
                    {category.count}
                  </span>
                </h1>

                {selectedCategory === category.category_id && close && (
                  <div className="series_data_list" role="region" aria-label="Series List">
                    <div ref={seriesDataListRef}>
                      <SeriesList seriesList={seriesList} isFocused={isFocused} />
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
     ) : (
              <div
        className="movie-categories-container"
        role="region"
        aria-label="Movie Categories"
      >
        <div className="movie-categories-list-container">
          <ul
            className="movie-categories"
            role="listbox"
            aria-activedescendant={`category-${focusedIndex}`}
            tabIndex="0"
          >
            {seriesCategories?.map((category, index) => (
              <li
                ref={(el) => (itemRefs.current[index] = el)}
                className={`movie-category ${
                  isFocused === 1 && focusedIndex === index ? "focused" : ""
                } ${
                  selectedCategory === category.category_id ? "selected" : ""
                }`}
                key={category.category_id}
                onClick={() => handleCategoryClick(category.category_id)}
                role="option"
                aria-selected={selectedCategory === category.category_id}
                id={`category-${index}`}
                tabIndex={isFocused === 1 && focusedIndex === index ? 0 : -1}
              >
                <h1 className="category-name">
                  {category.category_name}
                  {category.count && (
                    <span
                      className="category-count"
                      aria-label={`${category.count} items`}
                    >
                      {category.count}
                    </span>
                  )}
                </h1>

                {selectedCategory === category.category_id && close && (
                  <div
                    className="movie_data_list"
                    role="region"
                    aria-label="Movie List"
                  >
                    <div ref={seriesDataListRef}>
                      <MovieList
                        moviesList={seriesList}
                        isFocused={isFocused}
                      />
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
     )
       }
    </>
   
  );
}

export default Block;
