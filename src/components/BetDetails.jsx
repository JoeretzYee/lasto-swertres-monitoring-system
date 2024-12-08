import React, { useEffect, useState } from "react";
import { collection, db, getDocs } from "../firebase"; // Adjust to your Firebase config file

const BetDetails = () => {
  const [users, setUsers] = useState([]);
  const [betsByStation, setBetsByStation] = useState({});
  const [activeStation, setActiveStation] = useState(null); // To track the active station tab
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format number with comma separator
  const formatCurrency = (amount) => {
    return amount.toLocaleString("en-US", { minimumFractionDigits: 2 });
  };

  // Fetch users and bets
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch users
        const usersSnapshot = await getDocs(collection(db, "users"));
        const fetchedUsers = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(fetchedUsers);

        // Fetch bets
        const betsSnapshot = await getDocs(collection(db, "bets"));
        const fetchedBets = betsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Group bets by station based on user data
        const groupedBets = {};
        fetchedBets.forEach((bet) => {
          const user = fetchedUsers.find((user) => user.email === bet.user);
          if (user) {
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

        // Sort the stations numerically
        const sortedStations = Object.keys(groupedBets).sort((a, b) => {
          const numA = parseInt(a.match(/\d+/) || 0, 10); // Extract number from "Station X"
          const numB = parseInt(b.match(/\d+/) || 0, 10);
          return numA - numB;
        });

        // Create a new object with sorted keys
        const sortedGroupedBets = {};
        sortedStations.forEach((station) => {
          sortedGroupedBets[station] = groupedBets[station];
        });

        setBetsByStation(sortedGroupedBets);

        // Set first station as active tab
        setActiveStation(sortedStations[0]);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading bets...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-4">
      <h3>Bets by Station</h3>
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
          // Calculate total amount for this station
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
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Reference No</th>
                      <th>Draw Date</th>
                      <th>Draw Time</th>
                      <th>Bets</th>
                      <th>Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bets.map((bet) => (
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
