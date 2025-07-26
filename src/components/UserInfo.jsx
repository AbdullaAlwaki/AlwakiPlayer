
const UserInfo = () => {
 /*  const { status, exp_date, is_trial, active_cons, created_at, max_connections } = userInfo.user_info; */
  const userInfo = JSON.parse(sessionStorage.getItem('currentProfile')).user_info || {};

  console.log("User Info:", userInfo);
  
  return (
    <div style={{
      minHeight: '100vh',
      width: '90%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      position: 'relative',
      left: "10%",
    }}>
      <div style={{
        background: '#23283a',
        color: '#fff',
        borderRadius: 12,
        padding: 28,
        minWidth: 320,
        width: 'fit-content',
        height: 'fit-content',
        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        fontFamily: 'inherit',
        textAlign: 'left',
        margin: 0,
      }}>
        <h2 style={{marginTop: 0, marginBottom: 18, fontWeight: 600, fontSize: 22, letterSpacing: 1}}>User Info</h2>
        <div style={{lineHeight: 1.7, fontSize: 16}}>
          <p><strong>Status:</strong> {userInfo.status}</p>
          <p><strong>Created At:</strong> {userInfo.created_at ? new Date(userInfo.created_at * 1000).toLocaleDateString() : '-'}</p>
          <p><strong>Expiration Date:</strong> {userInfo.exp_date === null ? 'Never' : userInfo.exp_date ? new Date(userInfo.exp_date * 1000).toLocaleDateString() : '-'}</p>
          <p><strong>Is Trial:</strong> {userInfo.is_trial == "0" ? 'No' : 'Yes'}</p>
          <p><strong>Active Connections:</strong> {userInfo.active_cons}</p>
          <p><strong>Max Connections:</strong> {userInfo.max_connections}</p>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
