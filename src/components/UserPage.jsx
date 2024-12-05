import React from "react";
import { getAuth, signOut } from "../firebase";
import UserForm from "./UserForm";

function UserPage({ user, userData }) {
  const logout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        console.log("User logged out");
        // Redirect to login page or take appropriate action
        window.location.href = "/"; // Or use `navigate("/")` if inside a React Router setup
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <div className="container-fluid d-flex flex-column align-items-start justify-content-start py-3  text-black">
      {/* container up */}
      <div className="container-fluid d-flex align-items-center justify-content-between">
        <small className="bg-white text-dark p-2">{userData.email}</small>

        <button className="btn btn-small btn-danger" onClick={logout}>
          logout
        </button>
      </div>
      <br />
      {/* contiainer middle */}
      <div className="container-fluid d-flex align-items-center justify-content-center   p-4">
        <UserForm userData={userData} />
      </div>
    </div>
  );
}

export default UserPage;
