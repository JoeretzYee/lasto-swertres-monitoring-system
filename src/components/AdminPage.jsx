import React, { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  getAuth,
  db,
  signOut,
  collection,
  getDocs,
  doc,
  getDoc,
} from "../firebase";
import { Link } from "react-router-dom";
import Table from "./Table";
import SignupUser from "./SignupUser";
import BetDetails from "./BetDetails";

function AdminPage({ user }) {
  //states
  const [betsData, setBetsdata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchBets = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "bets"));
        const fetchedBets = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Include document ID
          ...doc.data(), // Spread the document data
        }));
        setBetsdata(fetchedBets);
      } catch (err) {
        console.error("Error fetching bets:", err);
        setError("Failed to fetch bets.");
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, []);

  console.log("bets data: ", betsData);
  //functions
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
        <small>{user.email}</small>
        <button className="btn btn-small btn-primary" onClick={logout}>
          logout
        </button>
      </div>
      <br />
      {/* table for all stations data */}
      <BetDetails />

      <br />
      {/* forms for signing up user */}
      <SignupUser />
    </div>
  );
}

export default AdminPage;
