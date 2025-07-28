import React, { useEffect, useState } from "react";
import { collection, db, getAuth, getDocs, signOut } from "../firebase";
import BetDetails from "./BetDetails";
import SignupUser from "./SignupUser";
import DeleteUser from "./DeleteUser";
import AddResultModal from "../modals/AddResultModal";
import AddLoadModal from "../modals/AddLoadModal";
import StationCard from "./StationCard";
import BulletinBoard from "./BulletinBoard";

function AdminPage({ user }) {
  //states
  const [betsData, setBetsdata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State to control delete user modal
  const [isAddResultModalOpen, setIsAddResultModalOpen] = useState(false);
  const [isAddLoadModalOpen, setIsAddLoadModalOpen] = useState(false);
  const [users, setUsers] = useState([]);

  // Fetching the users to show in the delete dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const fetchedUsers = usersSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => user.email !== "admin@gmail.com")
          .sort((a, b) => {
            const getStationNumber = (station) => {
              const match = station.match(/\d+/); // extract number from "Station X"
              return match ? parseInt(match[0]) : 0;
            };
            return getStationNumber(a.station) - getStationNumber(b.station);
          });

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
  const handleOpenAddResultModal = () => {
    setIsAddResultModalOpen(true);
  };
  const handleOpenAddLoadModal = () => {
    setIsAddLoadModalOpen(true);
  };

  const handleCloseAddResultModal = () => {
    setIsAddResultModalOpen(false);
  };
  const handleCloseAddLoadModal = () => {
    setIsAddLoadModalOpen(false);
  };
  const handleSaveResults = (results) => {
    // Handle saving the results (e.g., send to Firebase or update state)
    console.log("Saved Results:");
    // You can add your logic here to save the results
  };
  return (
    <div className="container-fluid d-flex flex-column align-items-start justify-content-start py-3  text-black">
      {/* container up */}
      <div className="container-fluid d-flex align-items-center justify-content-between flex-wrap">
        <small>{user.email}</small>
        <div className="">
          <button
            className="btn btn-md btn-primary "
            onClick={handleOpenAddResultModal}
          >
            Add Result for Today
          </button>{" "}
          {/* Render the modal */}
          {isAddResultModalOpen && (
            <AddResultModal
              isOpen={handleOpenAddResultModal}
              onClose={handleCloseAddResultModal}
              onSave={handleSaveResults}
            />
          )}
          &nbsp;
          <button
            className="btn btn-md btn-primary"
            onClick={handleOpenAddLoadModal}
          >
            Add Load
          </button>{" "}
          &nbsp;
          {isAddLoadModalOpen && (
            <AddLoadModal
              isOpen={handleOpenAddLoadModal}
              onClose={handleCloseAddLoadModal}
              onSave={handleSaveResults}
            />
          )}
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
          <button className="btn btn-md btn-dark mt-2 mt-sm-0" onClick={logout}>
            logout
          </button>
        </div>
      </div>
      <br />
      {/* all stations data */}
      <div
        className="container-fluid "
        style={{ height: "calc(100vh - 260px)", overflow: "hidden" }}
      >
        <div className="row h-100">
          {/* Left Section */}
          <div
            className="col-md-3 bg-dark text-white border-right-2 p-3 h-100 overflow-auto"
            style={{ borderRight: "1px solid #fff" }}
          >
            <BulletinBoard />
          </div>
          {/* Right Section */}
          <div
            className="col-md-9 bg-dark p-3 h-100 overflow-auto text-white"
            style={{ height: "100%", overflowY: "auto" }}
          >
            <div className="row">
              {users.map((user) => (
                <div className="col-sm-12 col-md-3 mb-2">
                  <StationCard station={user.station} email={user.email} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* <BetDetails /> */}

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
