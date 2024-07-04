import "./Loading.scss";

export default function Loading({ loading }) {
  return (
    <div className="main_loading">
        {loading && (
      <div className="loading"></div>
         )}
    </div>
  );
}
