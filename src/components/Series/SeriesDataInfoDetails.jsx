import React from 'react'

export default function SeriesDataInfoDetails({seriesData}) {
  return (
    <div className="seriesData_info_details">
    <div className="seriesData_info_details_release">
      <h2>Release Date</h2>
      <p>{seriesData?.info?.releaseDate}</p>
    </div>

    <div className="movieData_info_details_add">
      <h2>Added</h2>
      <p>
        {new Date(seriesData?.info?.last_modified * 1000).toDateString()}
      </p>
    </div>

    <div className="seriesData_info_details_cast">
      <h2>The Actors</h2>
      <p>{seriesData?.info?.cast}</p>
    </div>

    <div className="movieData_info_details_last_modified">
      <h2>Last Modified</h2>
      <p>
        {new Date(seriesData?.info?.last_modified * 1000).toDateString()}
      </p>
    </div>

    <div className="seriesData_info_details_director">
      <h2>Director</h2>
      <p>{seriesData?.info?.director}</p>
    </div>
  </div>
  )
}
