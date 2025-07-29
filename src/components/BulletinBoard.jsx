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
  showBreakdown = false,
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

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "results"),
      (querySnapshot) => {
        const fetchedResults = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const todaysResults = fetchedResults.find(
          (result) => result.date === todaysDate
        );

        if (todaysResults) {
          settwoPmLastoResult(todaysResults.lasto2pm || "-");
          settwoPmSwertresResult(todaysResults.swertres2pm || "-");

          setfivePmLastoResult(todaysResults.lasto5pm || "-");
          setfivePmSwertresResult(todaysResults.swertres5pm || "-");

          setNinePmLastoResult(todaysResults.lasto9pm || "-");
          setNinePmSwertresResult(todaysResults.swertres9pm || "-");

          // If you add pick3 later, you can handle it here too
        }

        setResultsData(todaysResults ? [todaysResults] : []);
      }
    );

    return () => unsubscribe();
  }, []);

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
          <td></td>
          <td></td>
          <td>10,30,40</td>
        </tr>
      </tbody>

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
      <p>
        Total:{" "}
        <strong className="text-success">
          ₱{formatCommaNumber(overAllTotal)}
        </strong>
      </p>
    </table>
  );
}

export default BulletinBoard;
