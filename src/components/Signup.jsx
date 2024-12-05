import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getAuth,
  createUserWithEmailAndPassword,
  db,
  setDoc,
  doc,
} from "../firebase";

function Signup() {
  //firebase auth
  const auth = getAuth();
  const navigate = useNavigate();
  //state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    isAdmin: false,
    station: "",
  });
  //stations
  const stations = Array.from({ length: 25 }, (_, i) => `Station ${i + 1}`);

  //functions
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
      ...(type === "checkbox" && name === "isAdmin" && checked
        ? { station: "" } // Reset station if isAdmin is checked
        : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.username,
        formData.password
      );

      const user = userCredential.user;
      console.log("User Created: ", user);

      // Save additional user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: formData.username,
        password: formData.password,
        isAdmin: formData.isAdmin,
        station: formData.isAdmin ? null : formData.station, // Save only if not admin
      });

      Swal.fire({
        title: "Success!",
        text: "You have signed up successfully.",
        icon: "success",
        confirmButtonText: "Go to Login",
      }).then(() => {
        navigate("/"); // Navigate to the login page after the alert
      });
    } catch (error) {
      console.error("Signup Error: ", error);
    }
  };
  return (
    <div className="container d-flex flex-column align-items-center justify-content-center mt-5">
      <h2 className="text-center mb-4">Signup</h2>
      <form onSubmit={handleSubmit} className="w-50 mx-auto">
        {/* Username Field */}
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="text"
            className="form-control"
            id="username"
            name="username"
            value={formData.username}
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

        {/* Admin Checkbox */}
        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            id="isAdmin"
            name="isAdmin"
            checked={formData.isAdmin}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="isAdmin">
            Are you an Admin?
          </label>
        </div>

        {/* Station Dropdown */}
        {!formData.isAdmin && (
          <div className="mb-3">
            <label htmlFor="station" className="form-label">
              Select Station
            </label>
            <select
              className="form-select"
              id="station"
              name="station"
              value={formData.station}
              onChange={handleChange}
              required
              style={{ maxHeight: "200px", overflowY: "auto" }} // Scrollable dropdown styling
            >
              <option value="" disabled>
                Choose a station
              </option>
              {stations.map((station, index) => (
                <option key={index} value={station}>
                  {station}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary w-100">
          Signup
        </button>
      </form>
      <div className="container text-center">
        <small>Already have an account?</small>
        <Link to="/login">login</Link>
      </div>
    </div>
  );
}

export default Signup;
