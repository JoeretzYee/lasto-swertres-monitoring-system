import React, { useEffect, useState } from "react";
import { collection, db, getDocs } from "../firebase"; // Adjust to your Firebase config file
import "../css/BetDetails.css";
import * as XLSX from "xlsx"; // Import xlsx library

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

  // Function to calculate totals for "lasto" and "swertres"
  const calculateGameTotals = (bets) => {
    const gameTotals = {
      lasto: 0,
      swertres: 0,
      pick3: 0,
    };

    bets.forEach((bet) => {
      bet.bets.forEach((b) => {
        if (b.game === "lasto") {
          gameTotals.lasto += b.amount || 0;
        } else if (b.game === "swertres") {
          gameTotals.swertres += b.amount || 0;
        } else if (b.game === "pick3") {
          gameTotals.pick3 += b.amount || 0;
        }
      });
    });

    return gameTotals;
  };

  // generate Report
  const handleGenerateReport = () => {
    const activeBets = betsByStation[activeStation].bets;
    const timeTotals = calculateTimeTotals(activeBets);

    // Prepare the data in the required format
    const formattedData = activeBets.map((bet) => {
      const betTime = bet.drawDate.time;
      return {
        referenceNo: bet.referenceNo,
        drawDate: bet.drawDate.date,
        drawTime: bet.drawDate.time,
        bets: bet.bets
          .map((b) => `${b.game}: ${b.number} - ₱${formatCurrency(b.amount)}`)
          .join(", "),
        "2pm Total":
          betTime === "14:00" || betTime === "2pm"
            ? "₱" + formatCurrency(bet.total?.amount)
            : "-",
        "5pm Total":
          betTime === "17:00" || betTime === "5pm"
            ? "₱" + formatCurrency(bet.total?.amount)
            : "-",
        "9pm Total":
          betTime === "21:00" || betTime === "9pm"
            ? "₱" + formatCurrency(bet.total?.amount)
            : "-",
      };
    });

    // Add totals row
    const totalRow = {
      referenceNo: "Total",
      drawDate: "",
      drawTime: "",
      bets: "",
      "2pm Total": "₱" + formatCurrency(timeTotals["2pm"]),
      "5pm Total": "₱" + formatCurrency(timeTotals["5pm"]),
      "9pm Total": "₱" + formatCurrency(timeTotals["9pm"]),
    };

    formattedData.push(totalRow);

    // Convert to worksheet
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bets Report");

    // Generate and download the Excel file
    XLSX.writeFile(wb, `${activeStation}_Bets_Report.xlsx`);
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
          const timeTotals = calculateTimeTotals(data.bets);
          const gameTotals = calculateGameTotals(data.bets);
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
              <div className=" d-flex align-items-center justify-content-between bg-red w-100 p-2">
                <h4>
                  {station} - {data.users.map((user) => user.email).join(", ")}
                </h4>

                <button
                  onClick={handleGenerateReport}
                  className="btn btn-sm btn-success"
                >
                  Generate Report
                </button>
              </div>

              {data.bets.length > 0 ? (
                <table className="table table-bordered betDetails_table">
                  <thead className="betDetails_thead">
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
                      .map((bet) => {
                        const betTime = bet.drawDate.time;
                        return (
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
                        ₱{formatCurrency(timeTotals["2pm"])}
                      </td>
                      <td className="fw-bold">
                        ₱{formatCurrency(timeTotals["5pm"])}
                      </td>
                      <td className="fw-bold">
                        ₱{formatCurrency(timeTotals["9pm"])}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="4" className="text-end fw-bold">
                        Lasto Total
                      </td>
                      <td colSpan="3" className="fw-bold">
                        ₱{formatCurrency(gameTotals.lasto)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="4" className="text-end fw-bold">
                        Swertres Total
                      </td>
                      <td colSpan="3" className="fw-bold">
                        ₱{formatCurrency(gameTotals.swertres)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="4" className="text-end fw-bold">
                        Pick 3 Total
                      </td>
                      <td colSpan="3" className="fw-bold">
                        ₱{formatCurrency(gameTotals.pick3)}
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
