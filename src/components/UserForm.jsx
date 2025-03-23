import React, { useEffect, useState } from "react";
import { addDoc, collection, db, onSnapshot } from "../firebase";
import Swal from "sweetalert2";

const generateUniqueReferenceNo = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const UserForm = ({ userData, isOpen, onClose }) => {
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
  const [additionalNumbers, setAdditionalNumbers] = useState([
    "",
    "",
    "",
    "",
    "",
  ]); // For Pick 3
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [disabledTimes, setDisabledTimes] = useState([]);
  const [loadControlData, setLoadControlData] = useState(null); // To store loadControl data

  // Fetch loadControl data in real-time using onSnapshot
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "loadControl"),
      (querySnapshot) => {
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          setLoadControlData(docData);
        } else {
          setLoadControlData(null); // Reset if the collection is empty
        }
      }
    );

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // Handlers
  const handleReferenceNoChange = (e) => setReferenceNo(e.target.value);
  const handleDateChange = (e) => setSelectedDate(e.target.value);
  const handleTimeChange = (e) => setSelectedTime(e.target.value);
  const handleGameChange = (e) => {
    setGame(e.target.value);
    setNumber(""); // Reset number field when game changes
    setAdditionalNumbers(["", "", "", "", ""]); // Reset additional numbers
  };
  const handleNumberChange = (e) => setNumber(e.target.value);
  const handleAdditionalNumberChange = (index, value) => {
    const newAdditionalNumbers = [...additionalNumbers];
    newAdditionalNumbers[index] = value;
    setAdditionalNumbers(newAdditionalNumbers);
  };
  const handleAmountChange = (e) => setAmount(e.target.value);

  const handleAddBet = () => {
    if (game && amount) {
      // Validate number length based on game
      if (game === "lasto" && number.length !== 2) {
        Swal.fire({
          icon: "error",
          title: "Invalid Number",
          text: "Lasto (L2) requires a 2-digit number.",
        });
        return;
      } else if (game === "swertres" && number.length !== 3) {
        Swal.fire({
          icon: "error",
          title: "Invalid Number",
          text: "Swertres (S3) requires a 3-digit number.",
        });
        return;
      } else if (game === "pick3") {
        // Validate all 6 numbers for Pick 3
        const allNumbers = [number, ...additionalNumbers];
        if (allNumbers.some((num) => num.length !== 3)) {
          Swal.fire({
            icon: "error",
            title: "Invalid Number",
            text: "Pick 3 requires 6 numbers, each with 3 digits.",
          });
          return;
        }
      }

      // Check if the number is controlled
      const isControlledNumber =
        loadControlData?.controlNumber?.numbers?.includes(parseInt(number));

      // Validate the bet amount based on whether the number is controlled
      if (isControlledNumber) {
        const maxBetAmount = loadControlData.controlNumber.controlLoad; // Max bet is controlLoad
        if (parseFloat(amount) > maxBetAmount) {
          Swal.fire({
            icon: "error",
            title: "Bet Limit Exceeded",
            text: `The maximum bet for controlled number ${number} is ${maxBetAmount}.`,
          });
          return;
        }
      } else {
        // For non-controlled numbers, check against the load value
        if (parseFloat(amount) > loadControlData?.load) {
          Swal.fire({
            icon: "error",
            title: "Bet Limit Exceeded",
            text: `The maximum bet for any number is ${loadControlData?.load}.`,
          });
          return;
        }
      }

      // Add the bet
      const bet = {
        game,
        number:
          game === "pick3" ? [number, ...additionalNumbers].join(", ") : number,
        amount: parseFloat(amount),
      };
      setBets([...bets, bet]);
      setNumber("");
      setAdditionalNumbers(["", "", "", "", ""]);
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
      // setTimeout(() => {
      //   window.location.reload();
      // }, 1000);
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
    <div className="modal fade show" style={{ display: "block" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Bet</h5>
            <button
              className="btn-close"
              type="button"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
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
                      <option
                        value="2pm"
                        disabled={disabledTimes.includes("2pm")}
                      >
                        2 PM
                      </option>
                      <option
                        value="5pm"
                        disabled={disabledTimes.includes("5pm")}
                      >
                        5 PM
                      </option>
                      <option
                        value="9pm"
                        disabled={disabledTimes.includes("9pm")}
                      >
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
                        <option value="pick3">Pick 3</option>
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
                      {game === "pick3" && (
                        <>
                          {additionalNumbers.map((num, index) => (
                            <input
                              key={index}
                              type="text"
                              className="form-control mt-2"
                              placeholder={`Number ${index + 2}`}
                              value={num}
                              onChange={(e) =>
                                handleAdditionalNumberChange(
                                  index,
                                  e.target.value
                                )
                              }
                            />
                          ))}
                        </>
                      )}
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
                              {bet.game === "lasto"
                                ? "Lasto (L2)"
                                : bet.game === "swertres"
                                ? "Swertres (S3)"
                                : "Pick 3"}
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

                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
                {message && <p className="mt-3">{message}</p>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
