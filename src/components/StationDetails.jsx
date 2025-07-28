import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  collection,
  db,
  getAuth,
  getDocs,
  onSnapshot,
  signOut,
} from "../firebase";
import BulletinBoard from "./BulletinBoard";
import getTodaysDate from "../utils/getTodaysDate";

function StationDetails() {
  const { email } = useParams();
  const todaysDate = getTodaysDate();
  const [betsData, setBetsData] = useState([]);
  const [error, setError] = useState(null);
  const [todaysTotal, setTodaysTotal] = useState(0);

  //fetching all bets
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "bets"),
      (querySnapshot) => {
        const fetchedBets = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // ✅ Filter only bets for this email and today's date
        const filteredBets = fetchedBets.filter(
          (bet) => bet.email === email && bet.drawDate?.date === todaysDate
        );

        // ✅ Calculate total for today's bets
        const totalAmount = filteredBets.reduce(
          (sum, bet) => sum + (bet.amount || 0),
          0
        );

        setTodaysTotal(totalAmount);
        setBetsData(filteredBets);
      },
      (error) => {
        console.error("Error listening to real-time listener: ", error);
        setError("Failed to get real-time listener");
      }
    );

    return () => unsubscribe();
  }, [email, todaysDate]);

  return (
    <div className="container-fluid d-flex align-items-center justify-content-between flex-wrap">
      <Link to="/admin" className="btn btn-sm btn-dark text-white">
        Back
      </Link>
      <br />
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
            <BulletinBoard todaysTotal={0} />
          </div>
          {/* Right Section */}
          <div
            className="col-md-9 bg-dark p-3 h-100 overflow-auto text-white"
            style={{ height: "100%", overflowY: "auto" }}
          >
            <div className="row">hello {email}</div>
            <h4>Station Bets for {email}</h4>
            {error && <p className="text-danger">{error}</p>}
            {betsData.length === 0 ? (
              <p>No bets for today.</p>
            ) : (
              <ul className="list-group">
                {betsData.map((bet) => (
                  <li
                    key={bet.id}
                    className="list-group-item bg-dark text-white d-flex justify-content-between"
                  >
                    <span>{bet.drawDate?.date}</span>
                    <span>{bet.amount}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StationDetails;
