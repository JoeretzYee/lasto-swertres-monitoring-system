import React from "react";
import { Navigate } from "react-router-dom";

function PrivateRoute({ user, userData, element, adminOnly = false }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only show loading if user exists BUT userData isn't loaded yet
  if (user && !userData) {
    return <div className="text-center py-5">Loading user data...</div>;
  }

  if (adminOnly && !userData.isAdmin) {
    return <Navigate to="/user" replace />;
  }

  return element;
}

export default PrivateRoute;

// import React from "react";
// import { Navigate } from "react-router-dom";

// function PrivateRoute({ user, element }) {
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   return element;
// }

// export default PrivateRoute;
