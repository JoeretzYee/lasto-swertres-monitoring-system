import React, { useEffect, useState } from "react";

import {
  collection,
  db,
  getAuth,
  getDocs,
  onSnapshot,
  signOut,
} from "../firebase";
import BetDetails from "./BetDetails";
import SignupUser from "./SignupUser";
import DeleteUser from "./DeleteUser";
import AddResultModal from "../modals/AddResultModal";
import AddLoadModal from "../modals/AddLoadModal";
import StationCard from "./StationCard";
import BulletinBoard from "./BulletinBoard";
import getTodaysDate from "../utils/getTodaysDate";

function AdminPage({ user }) {
  const todaysDate = getTodaysDate();

  //states
  const [selectedDate, setSelectedDate] = useState(todaysDate);
  const [betsData, setBetsdata] = useState([]);
  // const [todaysTotal, setTodaysTotal] = useState(0);
  const [selectedDateTotal, setSelectedDateTotal] = useState(0);
  // const [todaysAll2pmTotal, setTodaysAll2pmTotal] = useState(0);
  const [selectedDate2pmTotal, setSelectedDate2pmTotal] = useState(0);
  // const [todaysAll5pmTotal, setTodaysAll5pmTotal] = useState(0);
  const [selectedDate5pmTotal, setSelectedDate5pmTotal] = useState(0);
  // const [todaysAll9pmTotal, setTodaysAll9pmTotal] = useState(0);
  const [selectedDate9pmTotal, setSelectedDate9pmTotal] = useState(0);
  const [todaysLastoTotal, setTodaysLastoTotal] = useState(0);
  const [todaysSwertresTotal, setTodaysSwertresTotal] = useState(0);
  const [todaysPickThreeTotal, setTodaysPickThreeTotal] = useState(0);
  const [todaysFourD60Total, setTodaysFourD60Total] = useState(0);

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
  //fetching all bets
  useEffect(() => {
    let all2pmTotal = 0;
    let all5pmTotal = 0;
    let all9pmTotal = 0;

    let lastoTotal = 0;
    let swertresTotal = 0;
    let pickThreeTotal = 0;
    let fourD60Total = 0;

    const unsubscribe = onSnapshot(
      collection(db, "bets"),
      (querySnapshot) => {
        const fetchedBets = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const todaysBets = fetchedBets.filter(
          (bet) => bet.drawDate?.date === selectedDate
        );
        const totalAmount = todaysBets.reduce(
          (sum, bet) => (sum += bet.total.amount),
          0
        );

        todaysBets.forEach((bet) => {
          const time = bet.drawDate?.time;
          const amount = bet.total?.amount || 0;

          // Totals by time
          if (time === "2pm") all2pmTotal += amount;
          else if (time === "5pm") all5pmTotal += amount;
          else if (time === "9pm") all9pmTotal += amount;

          // Totals by game type
          bet.bets.forEach((b) => {
            if (b.game === "lasto") lastoTotal += b.amount;
            else if (b.game === "swertres") swertresTotal += b.amount;
            else if (b.game === "pick3") pickThreeTotal += b.amount;
            else if (b.game === "4d60") fourD60Total += b.amount;
          });
        });

        setSelectedDate2pmTotal(all2pmTotal);
        setSelectedDate5pmTotal(all5pmTotal);
        setSelectedDate9pmTotal(all9pmTotal);

        setTodaysLastoTotal(lastoTotal);
        setTodaysSwertresTotal(swertresTotal);
        setTodaysPickThreeTotal(pickThreeTotal);
        setTodaysFourD60Total(fourD60Total);

        setSelectedDateTotal(totalAmount);
        setBetsdata(fetchedBets);
      },
      (error) => {
        console.error("Error listening to real-time listener: ", error);
        setError("Failed to get real-time listener");
      }
    );

    return () => unsubscribe();
  }, [selectedDate]);

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
        {/* Left - email */}
        <small>{user.email}</small>

        {/* Center - date input */}
        <input
          type="date"
          className="form-control w-50 mx-2"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <br />
        {/* Right - button groups */}
        <div className="d-flex justify-content-between flex-grow-1 mt-2 mt-sm-0">
          {/* Left button group */}
          <div>
            <button
              className="btn btn-md btn-primary"
              onClick={handleOpenAddResultModal}
            >
              Add Result for Today
            </button>
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
            </button>
            {isAddLoadModalOpen && (
              <AddLoadModal
                isOpen={handleOpenAddLoadModal}
                onClose={handleCloseAddLoadModal}
                onSave={handleSaveResults}
              />
            )}
            &nbsp;
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-md btn-primary"
            >
              Create User
            </button>
          </div>

          {/* Right button group */}
          <div className="ms-auto">
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="btn btn-md btn-danger me-2"
            >
              Delete User
            </button>
            <button className="btn btn-md btn-dark" onClick={logout}>
              Logout
            </button>
          </div>
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
            <BulletinBoard
              overAllTotal={selectedDateTotal}
              twoPmTotal={selectedDate2pmTotal}
              fivePmTotal={selectedDate5pmTotal}
              ninePmTotal={selectedDate9pmTotal}
              lastoTotal={todaysLastoTotal}
              swertresTotal={todaysSwertresTotal}
              pickThreeTotal={todaysPickThreeTotal}
              fourD60Total={todaysFourD60Total}
              selectedDate={selectedDate}
              showBreakdown={false}
            />
          </div>
          {/* Right Section */}
          <div
            className="col-md-9 bg-dark p-3 h-100 overflow-auto text-white"
            style={{ height: "100%", overflowY: "auto" }}
          >
            <div className="row">
              {users.map((user) => (
                <div className="col-sm-12 col-md-3 mb-2">
                  <StationCard
                    station={user.station}
                    email={user.email}
                    selectedDate={selectedDate}
                  />
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
