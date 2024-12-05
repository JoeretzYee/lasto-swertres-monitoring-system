import React, { useState } from "react";
import { db, collection, addDoc } from "../firebase";

const UserForm = ({ userData }) => {
  // States

  console.log("user dataaaa: ", userData.email);
  const [referenceNo, setReferenceNo] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  });
  const [selectedTime, setSelectedTime] = useState("2pm"); // Default time
  const [bets, setBets] = useState([]); // Bets array
  const [game, setGame] = useState("lasto"); // Default game type
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false); // Submission state
  const [message, setMessage] = useState(""); // Feedback message

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
      // Add to Firebase
      await addDoc(collection(db, "bets"), betData);
      setMessage("Bet successfully submitted!");
      setReferenceNo("");
      setSelectedDate(new Date().toISOString().split("T")[0]);
      setSelectedTime("2pm");
      setBets([]);
    } catch (error) {
      console.error("Error adding document: ", error);
      setMessage("Error submitting the bet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              <option value="2pm">2 PM</option>
              <option value="5pm">5 PM</option>
              <option value="9pm">9 PM</option>
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
            className="btn btn-success mt-3"
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

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
        {message && <p className="mt-3">{message}</p>}
      </form>
    </div>
  );
};

export default UserForm;
