import React from 'react'
import logo from "../../assets/logo.png";


export default function SeriesDataSeasons({seriesData, setSeasonNum, setSeriesData}) {

    const seasonData = (e) => {
        setSeasonNum(e.season_number);
        setSeriesData({
          ...seriesData,
          info: {
            ...seriesData.info,
            name: e.name,
            cover: e.cover,
            plot: e.overview || seriesData?.info?.plot,
          },
        });
      };
  return (
    <div className="seriesData_seasons">
    {seriesData?.seasons?.map((season, index) => (
      <div
        className="seasons"
        key={index}
        onClick={() => seasonData(season)}
      >
        <span className="seasons_icon">
          <img src={season.cover ? season.cover : logo} alt="" />
        </span>

        <p className="seasons_name">
          <span>{season.name}</span>
          {seriesData?.episodes[index + 1]?.length}
        </p>
      </div>
    ))}
  </div>
  )
}
