import React, { useEffect, useState } from "react";
import { collection, db, getAuth, getDocs, signOut } from "../firebase";
import BetDetails from "./BetDetails";
import SignupUser from "./SignupUser";

function AdminPage({ user }) {
  //states
  const [betsData, setBetsdata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        <div className="">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-md btn-warning"
          >
            Create User
          </button>{" "}
          &nbsp;
          <button className="btn btn-md btn-danger" onClick={logout}>
            logout
          </button>
        </div>
      </div>
      <br />
      {/* table for all stations data */}
      <BetDetails />

      <br />

      {/* Signup User Modal */}
      {isModalOpen && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="createUserModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="createUserModalLabel">
                  Create User
                </h5>
                <button
                  type="button"
                  className="close btn-sm btn-danger"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <SignupUser />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
