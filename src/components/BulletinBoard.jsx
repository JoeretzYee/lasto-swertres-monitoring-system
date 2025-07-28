import React from "react";
import formatCommaNumber from "../utils/formatCommaNumber";

function BulletinBoard({ todaysTotal }) {
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
            <strong>20</strong>
          </td>
          <td>
            <small>L2: </small>
            <strong>40</strong>
          </td>
          <td>
            <small>L2: </small>
            <strong>90</strong>
          </td>
        </tr>
        <tr>
          <td>
            <small>S3: </small>
            <strong>245</strong>
          </td>
          <td>
            <small>S3: </small>
            <strong>125</strong>
          </td>
          <td>
            <small>S3: </small>
            <strong>255</strong>
          </td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td>10,30,40</td>
        </tr>
      </tbody>
      <p>
        2pm Total: <strong className="text-success">₱500</strong>
      </p>
      <p>
        5pm Total: <strong className="text-success">₱500</strong>
      </p>
      <p>
        9pm Total: <strong className="text-success">₱500</strong>
      </p>
      <p>
        Total:{" "}
        <strong className="text-success">
          ₱{formatCommaNumber(todaysTotal ? todaysTotal : 0)}
        </strong>
      </p>
    </table>
  );
}

export default BulletinBoard;
