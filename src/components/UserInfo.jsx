import React from 'react';

const UserInfo = ({ userInfo }) => {
  const { status, exp_date, is_trial, active_cons, created_at, max_connections } = userInfo.user_info;
  console.log(userInfo);
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

export default UserInfo;
