import "./Loading.scss";
import PropTypes from 'prop-types';

export default function Loading({ loading }) {
  return (
    <div className="main_loading">
        {loading && (
      <div className="loading"></div>
         )}
    </div>
  );
}

Loading.propTypes = {
  loading: PropTypes.bool.isRequired,
};
