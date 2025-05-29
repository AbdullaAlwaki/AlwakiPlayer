import React from 'react';
import PropTypes from 'prop-types';

const UserInfo = ({ userInfo }) => {
  const { status, exp_date, is_trial, active_cons, created_at, max_connections } = userInfo.user_info;

  return (
    <div>
      <h2>User Info</h2>
      <p>Status: {status}</p>
      <p>Created At: {new Date(created_at * 1000).toLocaleDateString()}</p>
      <p>Expiration Date: {exp_date === null ? 'Never' : new Date(exp_date * 1000).toLocaleDateString()}</p>
      <p>Is Trial: {is_trial ? 'Yes' : 'No'}</p>
      <p>Active Connections: {active_cons}</p>
      <p>Max Connections: {max_connections}</p>
    </div>
  );
};

UserInfo.propTypes = {
  userInfo: PropTypes.shape({
    user_info: PropTypes.shape({
      status: PropTypes.string,
      exp_date: PropTypes.number,
      is_trial: PropTypes.bool,
      active_cons: PropTypes.number,
      created_at: PropTypes.number,
      max_connections: PropTypes.number,
    }).isRequired,
  }).isRequired,
};

export default UserInfo;
