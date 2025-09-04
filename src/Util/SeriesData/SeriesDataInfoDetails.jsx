export default function SeriesDataInfoDetails({ seriesData }) {

  return (
    <div className="seriesData_con">
      <div className="seriesData_info_details_cast">
        <h2>The Actors</h2>
        <p>{seriesData?.info?.cast}</p>
      </div>
      <div className="seriesData_info_details">
        <div className="seriesData_info_details_release">
          <h2>Release Date</h2>
          <p>{seriesData?.info?.releasedate ? seriesData?.info?.releasedate : seriesData?.info?.releaseDate}</p>
        </div>
        {seriesData?.movie_data?.added && (
          <div className="movieData_info_details_add">
            <h2>Added</h2>
            <p>{new Date(seriesData.movie_data.added * 1000).toDateString()}</p>
          </div>
        )}
        {seriesData?.info?.last_modified && (
          <div className="movieData_info_details_last_modified">
            <h2>Last Modified</h2>
            <p>
              {new Date(seriesData?.info?.last_modified * 1000).toDateString()}
            </p>
          </div>
        )}

        <div className="seriesData_info_details_director">
          <h2>Director</h2>
          <p>{seriesData?.info?.director}</p>
        </div>
      </div>
    </div>
  );
}
