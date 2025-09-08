import React, { useState, useEffect } from "react";
import formatCommaNumber from "../utils/formatCommaNumber";
import getTodaysDate from "../utils/getTodaysDate";
import {
  collection,
  db,
  getAuth,
  getDocs,
  onSnapshot,
  signOut,
} from "../firebase";
import { QuerySnapshot } from "firebase/firestore";

function BulletinBoard({
  twoPmTotal = 0,
  fivePmTotal = 0,
  ninePmTotal = 0,
  overAllTotal = 0,
  lastoTotal = 0,
  swertresTotal = 0,
  pickThreeTotal = 0,
  fourD60Total = 0,
  showBreakdown = false,
  selectedDate,
}) {
  const todaysDate = getTodaysDate();
  const [resultsData, setResultsData] = useState([]);
  const [twoPmLastoResult, settwoPmLastoResult] = useState(0);
  const [twoPmSwertresResult, settwoPmSwertresResult] = useState(0);
  const [fivePmSwertresResult, setfivePmSwertresResult] = useState(0);
  const [fivePmLastoResult, setfivePmLastoResult] = useState(0);
  const [ninePmLastoResult, setNinePmLastoResult] = useState(0);
  const [ninePmSwertresResult, setNinePmSwertresResult] = useState(0);
  const [pickThree, setPickThree] = useState(0);
  const [fourD60, setFourD60] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "results"),
      (querySnapshot) => {
        const fetchedResults = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const todaysResults = fetchedResults.find(
          (result) => result.date === selectedDate
        );

        if (todaysResults) {
          settwoPmLastoResult(todaysResults.lasto2pm || "-");
          settwoPmSwertresResult(todaysResults.swertres2pm || "-");

          setfivePmLastoResult(todaysResults.lasto5pm || "-");
          setfivePmSwertresResult(todaysResults.swertres5pm || "-");

          setNinePmLastoResult(todaysResults.lasto9pm || "-");
          setNinePmSwertresResult(todaysResults.swertres9pm || "-");

          setPickThree(todaysResults.pickThree);

          setFourD60(todaysResults.fourD60);

          // If you add pick3 later, you can handle it here too
        }

        setResultsData(todaysResults ? [todaysResults] : []);
      }
    );

    return () => unsubscribe();
  }, [selectedDate]);

  return (
    <table className="table table-dark table-responsive">
      <thead style={{ backgroundColor: "gray" }}>
        <th>2pm</th>
        <th>5pm</th>
        <th>9pm</th>
      </thead>
      <tbody>
        <tr>
          <td>
            <small>L2: </small>
            <strong>{twoPmLastoResult}</strong>
          </td>
          <td>
            <small>L2: </small>
            <strong>{fivePmLastoResult}</strong>
          </td>
          <td>
            <small>L2: </small>
            <strong>{ninePmLastoResult}</strong>
          </td>
        </tr>
        <tr>
          <td>
            <small>S3: </small>
            <strong>{twoPmSwertresResult}</strong>
          </td>
          <td>
            <small>S3: </small>
            <strong>{fivePmSwertresResult}</strong>
          </td>
          <td>
            <small>S3: </small>
            <strong>{ninePmSwertresResult}</strong>
          </td>
        </tr>
        <tr>
          <td>
            <small>pick3: </small>
            <strong>{pickThree}</strong>
          </td>
          <td>
            <small>4D60:</small>
            <strong>{fourD60}</strong>
          </td>
          <td></td>
        </tr>
      </tbody>

      <div className="row">
        {/* Left side: by time */}
        <div className="col-md-6">
          <p>
            2pm Total:{" "}
            <strong className="text-success">
              ₱{formatCommaNumber(twoPmTotal)}
            </strong>
          </p>
          <p>
            5pm Total:{" "}
            <strong className="text-success">
              ₱{formatCommaNumber(fivePmTotal)}
            </strong>
          </p>
          <p>
            9pm Total:{" "}
            <strong className="text-success">
              ₱{formatCommaNumber(ninePmTotal)}
            </strong>
          </p>
        </div>

        {/* Right side: by game type */}
        <div className="col-md-6">
          <p>
            Lasto Total:{" "}
            <strong className="text-success">
              ₱{formatCommaNumber(lastoTotal)}
            </strong>
          </p>
          <p>
            Swertres Total:{" "}
            <strong className="text-success">
              ₱{formatCommaNumber(swertresTotal)}
            </strong>
          </p>
          <p>
            Pick3 Total:{" "}
            <strong className="text-success">
              ₱{formatCommaNumber(pickThreeTotal)}
            </strong>
          </p>
          <p>
            4D60 Total:{" "}
            <strong className="text-success">
              ₱{formatCommaNumber(fourD60Total)}
            </strong>
          </p>
        </div>
      </div>

      {/* Bottom overall total */}
      <div className="mt-3 text-center">
        <p>
          Total:{" "}
          <strong className="text-success">
            ₱{formatCommaNumber(overAllTotal)}
          </strong>
        </p>
      </div>
    </table>
  );
}

export default BulletinBoard;
