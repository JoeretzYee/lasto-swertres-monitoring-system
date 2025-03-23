import React, { useEffect, useState } from "react";
import { getAuth, signOut, collection, onSnapshot, db } from "../firebase";
import UserForm from "./UserForm";

function UserPage({ user, userData }) {
  const [results, setResults] = useState([]); // State to store results
  const [loading, setLoading] = useState(true);

  // Fetch results in real-time
  useEffect(() => {
    const resultsCollection = collection(db, "results"); // Reference to the "results" collection

    // Set up a real-time listener
    const unsubscribe = onSnapshot(resultsCollection, (snapshot) => {
      const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
      const resultsData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((result) => result.date === today); // Filter results to only include today's date

      setResults(resultsData); // Update the results state
      setLoading(false); // Set loading to false
    });

    // Clean up the listener on unmount
    return () => unsubscribe();
  }, []);
  console.log("Results: " + results.length);
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
        <div>
          <button className="btn btn-small btn-danger" onClick={logout}>
            logout
          </button>
        </div>
      </div>
      <br />
      {/* contiainer middle */}
      <div className="container-fluid d-flex align-items-center justify-content-center flex-wrap   p-4">
        <div className="d-flex flex-column">
          <h1>Results</h1>
          {loading ? (
            <p>Loading results...</p>
          ) : results.length > 0 ? (
            results.map((result) => (
              <div
                key={result.id}
                className="d-flex align-items-center justify-content-center gap-4"
              >
                <div className="d-flex flex-column align-items-start justify-content-center">
                  <h6 className="bg-dark text-white p-2">Lasto 2pm</h6>&nbsp;
                  &nbsp;
                  <h6>{result.lasto2pm || 0}</h6>
                  <h6 className="bg-dark text-white p-2">Lasto 5pm</h6>&nbsp;
                  &nbsp;
                  <h6>{result.lasto5pm || 0}</h6>
                  <h6 className="bg-dark text-white p-2">Lasto 9pm</h6>&nbsp;
                  &nbsp;
                  <h6>{result.lasto9pm || 0}</h6>
                </div>
                <div className="d-flex flex-column">
                  <h6 className="bg-dark text-white p-2">Swertres 2pm</h6>&nbsp;
                  &nbsp;
                  <h6>{result.swertres2pm || 0}</h6>
                  <h6 className="bg-dark text-white p-2">Swertres 5pm</h6>&nbsp;
                  &nbsp;
                  <h6>{result.swertres5pm || 0}</h6>
                  <h6 className="bg-dark text-white p-2">Swertres 9pm</h6>&nbsp;
                  &nbsp;
                  <h6>{result.swertres9pm || 0}</h6>
                </div>
                <div className="d-flex flex-column">
                  <h6 className="bg-dark text-white p-2">Pick 3</h6>&nbsp;
                  &nbsp;
                  <h6>{result.pick3 || 0}</h6>
                </div>
              </div>
            ))
          ) : (
            <p>No results available.</p>
          )}
        </div>
        <UserForm userData={userData} />
      </div>
    </div>
  );
}

export default UserPage;
