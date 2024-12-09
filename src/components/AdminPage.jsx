import React, { useEffect, useState } from "react";
import { collection, db, getAuth, getDocs, signOut } from "../firebase";
import BetDetails from "./BetDetails";
import SignupUser from "./SignupUser";
import DeleteUser from "./DeleteUser";

function AdminPage({ user }) {
  //states
  const [betsData, setBetsdata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State to control delete user modal
  const [users, setUsers] = useState([]);

  // Fetching the users to show in the delete dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const fetchedUsers = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

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
            className="btn btn-md btn-warning "
          >
            Create User
          </button>{" "}
          &nbsp;
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="btn btn-md btn-danger"
          >
            Delete User
          </button>
          &nbsp;
          <button className="btn btn-md btn-dark" onClick={logout}>
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
      {/* Delete User Modal */}
      {isDeleteModalOpen && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="deleteUserModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="deleteUs-/erModalLabel">
                  Delete User
                </h5>
                <button
                  type="button"
                  className="close btn-sm btn-danger"
                  onClick={() => setIsDeleteModalOpen(false)}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <DeleteUser users={users} />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsDeleteModalOpen(false)}
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
