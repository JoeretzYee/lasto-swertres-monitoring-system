import React, { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const todaysDate = getTodaysDate();
  const selectedDate = location.state?.selectedDate || todaysDate;
  const [betsData, setBetsData] = useState([]);
  const [error, setError] = useState(null);
  const [todaysTotal, setTodaysTotal] = useState(0);
  const [todays2pmTotal, setTodays2pmTotal] = useState(0);
  const [todays5pmTotal, setTodays5pmTotal] = useState(0);
  const [todays9pmTotal, setTodays9pmTotal] = useState(0);

  const [eachStationLastoTotal, setEachStationLastoTotal] = useState(0);
  const [eachStationSwertresTotal, setEachStationSwertresTotal] = useState(0);
  const [eachStationPickThreeTotal, setEachStationPickThreeTotal] = useState(0);
  const [eachStationFourD60Total, setEachStationFourD60Total] = useState(0);

  //fetching all bets
  useEffect(() => {
    let total2pm = 0;
    let total5pm = 0;
    let total9pm = 0;

    let lastoTotal = 0;
    let swertresTotal = 0;
    let pickThreeTotal = 0;
    let fourDTotal = 0;

    const unsubscribe = onSnapshot(
      collection(db, "bets"),
      (querySnapshot) => {
        const fetchedBets = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter only bets for this email and today's date
        const filteredBets = fetchedBets.filter(
          (bet) => bet.user === email && bet.drawDate?.date === selectedDate
        );

        filteredBets.forEach((bet) => {
          const time = bet.drawDate?.time;
          const amount = bet.total?.amount || 0;

          // totals by time
          if (time === "2pm") {
            total2pm += amount;
          } else if (time === "5pm") total5pm += amount;
          else if (time === "9pm") total9pm += amount;

          // totals by game
          bet.bets.forEach((b) => {
            if (b.game === "lasto") {
              lastoTotal += b.amount;
            } else if (b.game === "swertres") {
              swertresTotal += b.amount;
            } else if (b.game === "pick3") {
              pickThreeTotal += b.amount;
            } else if (b.game === "fourD60") {
              fourDTotal += b.amount;
            }
          });
        });
        setTodays2pmTotal(total2pm);
        setTodays5pmTotal(total5pm);
        setTodays9pmTotal(total9pm);

        setEachStationLastoTotal(lastoTotal);
        setEachStationSwertresTotal(swertresTotal);
        setEachStationPickThreeTotal(pickThreeTotal);
        setEachStationFourD60Total(fourDTotal);

        // Calculate total for today's bets
        const totalAmount = filteredBets.reduce(
          (sum, bet) => (sum += bet.total.amount || 0),
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
  }, [email, selectedDate]);

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
            <BulletinBoard
              overAllTotal={todaysTotal}
              twoPmTotal={todays2pmTotal}
              fivePmTotal={todays5pmTotal}
              ninePmTotal={todays9pmTotal}
              lastoTotal={eachStationLastoTotal}
              swertresTotal={eachStationSwertresTotal}
              pickThreeTotal={eachStationPickThreeTotal}
              fourD60Total={eachStationFourD60Total}
              showBreakdown={true}
              selectedDate={selectedDate}
            />
          </div>
          {/* Right Section */}
          <div
            className="col-md-9 bg-dark p-3 h-100 overflow-auto text-white"
            style={{ height: "100%", overflowY: "auto" }}
          >
            <div className="row">
              <span>
                {" "}
                login as: <small className="text-muted"> {email} </small>{" "}
              </span>
            </div>
            <h4>Station Bets for {email}</h4>
            {error && <p className="text-danger">{error}</p>}
            {betsData.length === 0 ? (
              <p>No bets for today.</p>
            ) : (
              <table className="table table-dark table-responsive">
                <thead style={{ backgroundColor: "gray" }}>
                  <th>Reference No.</th>
                  <th>Draw Date</th>
                  <th>Draw Time</th>
                  <th>Bets</th>
                </thead>
                <tbody>
                  {betsData.map((bet) => (
                    <tr key={bet.id}>
                      <td>{bet.referenceNo}</td>
                      <td>{bet.drawDate?.date}</td>
                      <td>{bet.drawDate?.time}</td>

                      <td>
                        <ul className="list-unstyled mb-0">
                          {bet.bets.map((b, index) => (
                            <li key={index}>
                              {b.game} - {b.number} -{" "}
                              <span className="text-success">₱{b.amount}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
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

export default StationDetails;
