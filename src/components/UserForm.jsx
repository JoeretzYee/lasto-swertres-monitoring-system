import React, { useEffect, useState } from "react";
import { addDoc, collection, db } from "../firebase";

const generateUniqueReferenceNo = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const UserForm = ({ userData }) => {
  // States
  const [referenceNo, setReferenceNo] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedTime, setSelectedTime] = useState(() => {
    const now = new Date();
    const cutoffTimes = {
      "2pm": new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 45),
      "5pm": new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 45),
      "9pm": new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 45),
    };

    if (now >= cutoffTimes["9pm"]) {
      return "2pm"; // Next day cycle starts with 2 PM
    } else if (now >= cutoffTimes["5pm"]) {
      return "9pm";
    } else if (now >= cutoffTimes["2pm"]) {
      return "5pm";
    } else {
      return "2pm"; // Before 1:45 PM, default is 2 PM
    }
  });
  const [bets, setBets] = useState([]);
  const [game, setGame] = useState("lasto");
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [disabledTimes, setDisabledTimes] = useState([]);

  // Handlers
  const handleReferenceNoChange = (e) => setReferenceNo(e.target.value);
  const handleDateChange = (e) => setSelectedDate(e.target.value);
  const handleTimeChange = (e) => setSelectedTime(e.target.value);
  const handleGameChange = (e) => setGame(e.target.value);
  const handleNumberChange = (e) => setNumber(e.target.value);
  const handleAmountChange = (e) => setAmount(e.target.value);

  const handleAddBet = () => {
    if (game && number && amount) {
      setBets([...bets, { game, number, amount: parseFloat(amount) }]);
      setNumber("");
      setAmount("");
    }
  };

  const calculateTotal = () => {
    return bets.reduce(
      (totals, bet) => {
        totals.amount += bet.amount;
        totals.bets += 1;
        return totals;
      },
      { amount: 0, bets: 0 }
    );
  };

  const { amount: totalAmount, bets: totalBets } = calculateTotal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const betData = {
      referenceNo,
      drawDate: {
        date: selectedDate,
        time: selectedTime,
      },
      bets,
      total: {
        amount: totalAmount,
        bets: totalBets,
      },
      user: userData.email,
    };

    try {
      await addDoc(collection(db, "bets"), betData);
      setMessage("Bet successfully submitted!");
      setReferenceNo("");
      setSelectedDate(new Date().toISOString().split("T")[0]);
      setSelectedTime("2pm");
      setBets([]);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error adding document: ", error);
      setMessage("Error submitting the bet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Generate and set a unique reference number when the component loads
    setReferenceNo(generateUniqueReferenceNo());
  }, []);

  useEffect(() => {
    const updateDisabledTimes = () => {
      const now = new Date();
      const cutoffTimes = {
        "2pm": new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          13,
          45
        ),
        "5pm": new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          16,
          45
        ),
        "9pm": new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          20,
          45
        ),
      };

      const newDisabledTimes = Object.entries(cutoffTimes)
        .filter(([_, cutoffTime]) => now >= cutoffTime)
        .map(([time]) => time);

      setDisabledTimes(newDisabledTimes);

      // Adjust selectedTime if it becomes invalid
      if (newDisabledTimes.includes(selectedTime)) {
        if (!newDisabledTimes.includes("5pm")) {
          setSelectedTime("5pm");
        } else if (!newDisabledTimes.includes("9pm")) {
          setSelectedTime("9pm");
        } else {
          setSelectedTime("2pm"); // Default to next day's 2 PM
        }
      }
    };

    const interval = setInterval(updateDisabledTimes, 1000); // Update every second
    return () => clearInterval(interval);
  }, [selectedTime]);

  return (
    <div className="container mt-4">
      <form onSubmit={handleSubmit}>
        {/* Reference No. */}
        <div className="mb-3">
          <label htmlFor="referenceNo" className="form-label">
            Reference No.:
          </label>
          <input
            type="text"
            id="referenceNo"
            className="form-control"
            value={referenceNo}
            onChange={handleReferenceNoChange}
            placeholder="Enter reference number"
            required
          />
        </div>

        {/* Draw Field */}
        <div className="mb-3">
          <label htmlFor="drawDate" className="form-label">
            Draw Date:
          </label>
          <div className="d-flex align-items-center">
            <input
              type="date"
              id="drawDate"
              className="form-control me-2"
              value={selectedDate}
              onChange={handleDateChange}
            />
            <select
              id="drawTime"
              className="form-select"
              value={selectedTime}
              onChange={handleTimeChange}
            >
              <option value="2pm" disabled={disabledTimes.includes("2pm")}>
                2 PM
              </option>
              <option value="5pm" disabled={disabledTimes.includes("5pm")}>
                5 PM
              </option>
              <option value="9pm" disabled={disabledTimes.includes("9pm")}>
                9 PM
              </option>
            </select>
          </div>
        </div>

        {/* Add Bets */}
        <div className="mb-3">
          <label className="form-label">Add Bet:</label>
          <div className="row g-3">
            <div className="col-md-4">
              <select
                className="form-select"
                value={game}
                onChange={handleGameChange}
              >
                <option value="lasto">Lasto (L2)</option>
                <option value="swertres">Swertres (S3)</option>
              </select>
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Number"
                value={number}
                onChange={handleNumberChange}
              />
            </div>
            <div className="col-md-4">
              <input
                type="number"
                className="form-control"
                placeholder="Amount"
                value={amount}
                onChange={handleAmountChange}
              />
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary mt-3"
            onClick={handleAddBet}
          >
            Add Bet
          </button>
        </div>

        {/* Bets Table */}
        <div className="mb-3">
          <h5>Bets</h5>
          {bets.length > 0 ? (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Item No.</th>
                  <th>Game</th>
                  <th>Number</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((bet, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      {bet.game === "lasto" ? "Lasto (L2)" : "Swertres (S3)"}
                    </td>
                    <td>{bet.number}</td>
                    <td>{bet.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3">Total</td>
                  <td>
                    {totalAmount.toFixed(2)} ({totalBets} bets)
                  </td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <p>No bets added yet.</p>
          )}
        </div>

        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
        {message && <p className="mt-3">{message}</p>}
      </form>
    </div>
  );
};

export default UserForm;
