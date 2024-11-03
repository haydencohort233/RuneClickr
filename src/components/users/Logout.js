// /src/components/users/Logout.js
import React from 'react';

function Logout({ setUserId }) {
  const handleLogout = () => {
    setUserId(null);
    console.log('User logged out successfully');
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Logout
    </button>
  );
}

export default Logout;
