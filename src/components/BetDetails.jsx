import React, { useEffect, useState } from "react";
import { collection, db, getDocs } from "../firebase"; // Adjust to your Firebase config file
import "../css/BetDetails.css";

const BetDetails = () => {
  const [users, setUsers] = useState([]);
  const [betsByStation, setBetsByStation] = useState({});
  const [activeStation, setActiveStation] = useState(null); // To track the active station tab
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  ); // Default to today's date
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  ); // Default to today's date

  const formatCurrency = (amount) => {
    return amount.toLocaleString("en-US", { minimumFractionDigits: 2 });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const fetchedUsers = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(fetchedUsers);

        const betsSnapshot = await getDocs(collection(db, "bets"));
        const fetchedBets = betsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const groupedBets = {};
        fetchedBets.forEach((bet) => {
          const user = fetchedUsers.find((user) => user.email === bet.user);
          const betDate = bet.drawDate.date;

          // Filter by date range
          if (user && betDate >= startDate && betDate <= endDate) {
            const station = user.station || "Unknown Station";
            if (!groupedBets[station])
              groupedBets[station] = { bets: [], users: [] };
            groupedBets[station].bets.push(bet);
            if (
              !groupedBets[station].users.find((u) => u.email === user.email)
            ) {
              groupedBets[station].users.push(user);
            }
          }
        });

        const sortedStations = Object.keys(groupedBets).sort((a, b) => {
          const numA = parseInt(a.match(/\d+/) || 0, 10);
          const numB = parseInt(b.match(/\d+/) || 0, 10);
          return numA - numB;
        });

        const sortedGroupedBets = {};
        sortedStations.forEach((station) => {
          sortedGroupedBets[station] = groupedBets[station];
        });

        setBetsByStation(sortedGroupedBets);
        setActiveStation(sortedStations[0]);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  if (loading) return <p>Loading bets...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-4">
      <h3>Bets by Station</h3>
      <br />
      <div className="row mb-3">
        <div className="col">
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            className="form-control"
            value={startDate}
            onChange={handleStartDateChange}
          />
        </div>
        <div className="col">
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            className="form-control"
            value={endDate}
            onChange={handleEndDateChange}
          />
        </div>
      </div>
      {/* Tabs */}
      <ul className="nav nav-tabs" id="stationTabs" role="tablist">
        {Object.keys(betsByStation).map((station) => (
          <li className="nav-item" role="presentation" key={station}>
            <button
              className={`nav-link ${
                station === activeStation ? "active" : ""
              }`}
              type="button"
              onClick={() => setActiveStation(station)}
            >
              {station}
            </button>
          </li>
        ))}
      </ul>

      {/* Tab Content */}
      <div className="tab-content mt-3" id="stationTabsContent">
        {Object.entries(betsByStation).map(([station, data]) => {
          const totalAmount = data.bets.reduce(
            (sum, bet) => sum + (bet.total?.amount || 0),
            0
          );

          return (
            <div
              className={`tab-pane fade ${
                station === activeStation ? "show active" : ""
              }`}
              key={station}
            >
              <h4>
                {station} - {data.users.map((user) => user.email).join(", ")}
              </h4>
              {data.bets.length > 0 ? (
                <table className="table table-bordered betDetails_table">
                  <thead className="betDetails_thead">
                    <tr>
                      <th>Reference No</th>
                      <th>Draw Date</th>
                      <th>Draw Time</th>
                      <th>Bets</th>
                      <th>Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bets
                      .sort((a, b) => {
                        // Compare dates first
                        if (a.drawDate.date < b.drawDate.date) return -1;
                        if (a.drawDate.date > b.drawDate.date) return 1;

                        // If dates are the same, compare times
                        const timeA = new Date(
                          `1970-01-01T${a.drawDate.time}`
                        ).getTime();
                        const timeB = new Date(
                          `1970-01-01T${b.drawDate.time}`
                        ).getTime();
                        return timeA - timeB;
                      })
                      .map((bet) => (
                        <tr key={bet.id}>
                          <td>{bet.referenceNo}</td>
                          <td>{bet.drawDate.date}</td>
                          <td>{bet.drawDate.time}</td>
                          <td>
                            {bet.bets.map((b, idx) => (
                              <div key={idx}>
                                {b.game}: {b.number} - ₱
                                {formatCurrency(b.amount)}
                              </div>
                            ))}
                          </td>
                          <td>₱{formatCurrency(bet.total?.amount)}</td>
                        </tr>
                      ))}
                  </tbody>

                  <tfoot>
                    <tr>
                      <td colSpan="4" className="text-end fw-bold">
                        Total
                      </td>
                      <td className="fw-bold">
                        ₱{formatCurrency(totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <p>No bets for this station.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BetDetails;
