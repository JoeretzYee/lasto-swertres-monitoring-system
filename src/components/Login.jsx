import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigating after login
import {
  getAuth,
  signInWithEmailAndPassword,
  db,
  doc,
  getDoc,
} from "../firebase"; // Firebase Authentication functions
import Swal from "sweetalert2"; // SweetAlert2 for alerts

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const auth = getAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;
      // Fetch user data from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();

        // Check if the user is an admin or regular user
        if (userData.isAdmin) {
          // If admin, navigate to AdminPage
          Swal.fire({
            title: "Success!",
            text: "Welcome, Admin!",
            icon: "success",
            confirmButtonText: "Go to Admin Dashboard",
          }).then(() => {
            navigate("/admin"); // Redirect to Admin Page
          });
        } else {
          // If regular user, navigate to UserPage
          Swal.fire({
            title: "Success!",
            text: "Welcome, User!",
            icon: "success",
            confirmButtonText: "Go to User Dashboard",
          }).then(() => {
            navigate("/user"); // Redirect to User Page
          });
        }
      } else {
        Swal.fire({
          title: "Error!",
          text: "User data not found in database",
          icon: "error",
          confirmButtonText: "Try Again",
        });
      }
    } catch (error) {
      // Display error if login fails

      // Show error message with SweetAlert2
      Swal.fire({
        title: "Error!",
        text: error.message,
        icon: "error",
        confirmButtonText: "Try Again",
      });
      console.error("Login Error: ", error);
    }
  };

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center mt-5">
      <h2 className="text-center mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="w-50 mx-auto">
        {/* Email Field */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password Field */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
