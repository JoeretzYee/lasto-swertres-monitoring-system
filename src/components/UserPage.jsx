import React, { useEffect, useState } from "react";
import { getAuth, signOut, collection, onSnapshot, db } from "../firebase";
import UserForm from "./UserForm";

function UserPage({ user, userData }) {
  const [results, setResults] = useState([]); // State to store results
  const [bets, setBets] = useState([]); // State to store all user's bets
  const [filteredBets, setFilteredBets] = useState([]); // State to store filtered bets
  const [loading, setLoading] = useState(true);
  const [userFormModalOpen, setUserFormModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Default to today's date
  });

  const handleUserFormModalOpen = () => {
    setUserFormModalOpen(true);
  };
  const handleUserFormModalClose = () => {
    setUserFormModalOpen(false);
  };

  // Fetch results in real-time
  useEffect(() => {
    const resultsCollection = collection(db, "results"); // Reference to the "results" collection

    // Set up a real-time listener
    const unsubscribeResults = onSnapshot(resultsCollection, (snapshot) => {
      const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
      const resultsData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((result) => result.date === today); // Filter results to only include today's date

      setResults(resultsData); // Update the results state
    });

    // Clean up the listener on unmount
    return () => unsubscribeResults();
  }, []);

  // Fetch bets for the logged-in user in real-time
  useEffect(() => {
    const betsCollection = collection(db, "bets"); // Reference to the "bets" collection

    // Set up a real-time listener
    const unsubscribeBets = onSnapshot(betsCollection, (snapshot) => {
      const betsData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((bet) => bet.user === userData.email); // Filter bets to only include the logged-in user's bets

      setBets(betsData); // Update the bets state
      setLoading(false); // Set loading to false
    });

    // Clean up the listener on unmount
    return () => unsubscribeBets();
  }, [userData.email]);

  // Filter bets by selected date and sort by draw time
  useEffect(() => {
    const filtered = bets
      .filter((bet) => bet.drawDate.date === selectedDate)
      .sort((a, b) => {
        // Convert draw times to comparable format
        const timeA =
          a.drawDate.time === "2pm"
            ? "14:00"
            : a.drawDate.time === "5pm"
            ? "17:00"
            : "21:00";
        const timeB =
          b.drawDate.time === "2pm"
            ? "14:00"
            : b.drawDate.time === "5pm"
            ? "17:00"
            : "21:00";
        return timeA.localeCompare(timeB); // Sort in ascending order (2pm, 5pm, 9pm)
      });

    setFilteredBets(filtered);
  }, [bets, selectedDate]);

  // Calculate totals for each draw time
  const calculateTimeTotals = (bets) => {
    const timeTotals = {
      "2pm": 0,
      "5pm": 0,
      "9pm": 0,
    };

    bets.forEach((bet) => {
      const betTime = bet.drawDate.time;
      if (betTime === "14:00" || betTime === "2pm") {
        timeTotals["2pm"] += bet.total?.amount || 0;
      } else if (betTime === "17:00" || betTime === "5pm") {
        timeTotals["5pm"] += bet.total?.amount || 0;
      } else if (betTime === "21:00" || betTime === "9pm") {
        timeTotals["9pm"] += bet.total?.amount || 0;
      }
    });

    return timeTotals;
  };

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

  const formatCurrency = (amount) => {
    return amount.toLocaleString("en-US", { minimumFractionDigits: 2 });
  };

  return (
    <div className="container-fluid d-flex flex-column align-items-start justify-content-start py-3 text-black">
      {/* container up */}
      <div className="container-fluid d-flex align-items-center justify-content-between">
        <small className="bg-white text-dark p-2">{userData.email}</small>
        <div>
          <button
            className="btn btn-small btn-primary"
            onClick={handleUserFormModalOpen}
          >
            Add Bet
          </button>{" "}
          &nbsp;
          <button className="btn btn-small btn-danger" onClick={logout}>
            logout
          </button>
        </div>
      </div>
      <br />
      {/* container middle */}
      <div className="container-fluid d-flex align-items-center justify-content-center flex-wrap p-4">
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

        {/* Date Filter */}
        <div className="container mt-4">
          <label htmlFor="dateFilter" className="form-label">
            Filter by Date:
          </label>
          <input
            type="date"
            id="dateFilter"
            className="form-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Display User's Bets in a Table */}
        <div className="container mt-4">
          <h2>Bets Today</h2>
          {filteredBets.length > 0 ? (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Reference No</th>
                  <th>Draw Date</th>
                  <th>Draw Time</th>
                  <th>Bets</th>
                  <th>2 PM Total</th>
                  <th>5 PM Total</th>
                  <th>9 PM Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredBets.map((bet) => {
                  const betTime = bet.drawDate.time;
                  return (
                    <tr key={bet.id}>
                      <td>{bet.referenceNo}</td>
                      <td>{bet.drawDate.date}</td>
                      <td>{bet.drawDate.time}</td>
                      <td>
                        {bet.bets.map((b, idx) => (
                          <div key={idx}>
                            {b.game}: {b.number} - ₱{formatCurrency(b.amount)}
                          </div>
                        ))}
                      </td>
                      <td>
                        {betTime === "14:00" || betTime === "2pm"
                          ? "₱" + formatCurrency(bet.total?.amount)
                          : "-"}
                      </td>
                      <td>
                        {betTime === "17:00" || betTime === "5pm"
                          ? "₱" + formatCurrency(bet.total?.amount)
                          : "-"}
                      </td>
                      <td>
                        {betTime === "21:00" || betTime === "9pm"
                          ? "₱" + formatCurrency(bet.total?.amount)
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" className="text-end fw-bold">
                    Total
                  </td>
                  <td className="fw-bold">
                    ₱{formatCurrency(calculateTimeTotals(filteredBets)["2pm"])}
                  </td>
                  <td className="fw-bold">
                    ₱{formatCurrency(calculateTimeTotals(filteredBets)["5pm"])}
                  </td>
                  <td className="fw-bold">
                    ₱{formatCurrency(calculateTimeTotals(filteredBets)["9pm"])}
                  </td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <p>No bets submitted for the selected date.</p>
          )}
        </div>

        {userFormModalOpen && (
          <UserForm
            isOpen={handleUserFormModalOpen}
            onClose={handleUserFormModalClose}
            userData={userData}
          />
        )}
      </div>
    </div>
  );
}

export default UserPage;
