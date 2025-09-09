import React, { useEffect, useState } from "react";
import { collection, db, onSnapshot } from "../firebase";

function ViewBetNumbersModal({ isOpen, onClose, selectedDate }) {
  const [groupedBets, setGroupedBets] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // 🔹 search state

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);

    const unsubscribe = onSnapshot(
      collection(db, "bets"),
      (snapshot) => {
        const allBets = [];

        snapshot.docs.forEach((doc) => {
          const data = doc.data();

          // filter by selectedDate
          if (data.drawDate?.date !== selectedDate) return;

          if (Array.isArray(data.bets)) {
            data.bets.forEach((b) => {
              allBets.push({
                game: b.game,
                number: b.number,
                amount: b.amount,
              });
            });
          }
        });

        // Group by game + number
        const grouped = {};
        allBets.forEach(({ game, number, amount }) => {
          if (!grouped[game]) grouped[game] = {};
          if (!grouped[game][number]) grouped[game][number] = 0;
          grouped[game][number] += amount;
        });

        setGroupedBets(grouped);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to bets:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe(); // cleanup when modal closes
  }, [isOpen, selectedDate]);

  if (!isOpen) return null;

  // 🔹 Collect all unique numbers
  const allNumbers = [
    ...new Set(
      Object.values(groupedBets)
        .map((obj) => Object.keys(obj))
        .flat()
    ),
  ];

  // 🔹 Apply filter
  const filteredNumbers = allNumbers.filter((num) =>
    num.toString().includes(searchTerm)
  );

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      role="dialog"
      aria-hidden="true"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="modal-dialog modal-xl"
        role="document"
        style={{ maxWidth: "100%", margin: 0 }}
      >
        <div
          className="modal-content"
          style={{ height: "calc(100vh - 100px)" }}
        >
          <div className="modal-header">
            <h5 className="modal-title">Bet Numbers ({selectedDate})</h5>
            <button
              type="button"
              className="close btn-sm btn-danger"
              onClick={onClose}
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          {/* 🔹 Search Input */}
          <div className="px-3 pt-2">
            <input
              type="text"
              className="form-control"
              placeholder="Search by number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="modal-body">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="table table-bordered table-striped text-center">
                <thead>
                  <tr>
                    <th>Number</th>
                    <th>Lasto</th>
                    <th>Swertres</th>
                    <th>Pick3</th>
                    <th>FourD60</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNumbers.map((number) => (
                    <tr key={number}>
                      <td>{number}</td>
                      <td>{groupedBets.lasto?.[number] || 0}</td>
                      <td>{groupedBets.swertres?.[number] || 0}</td>
                      <td>{groupedBets.pick3?.[number] || 0}</td>
                      <td>{groupedBets.fourD60?.[number] || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewBetNumbersModal;
