import React from "react";
import { Link } from "react-router-dom";

function StationCard({ station, email }) {
  return (
    <div className="card text-center bg-success text-white">
      <div className="card-body">
        <h5 className="card-title">
          <strong>{station}</strong>
        </h5>
        <h6 className="card-subtitle mb-2 text-white">{email}</h6>

        <Link
          to={`/station-details/${email}`}
          className="btn btn-sm btn-dark w-100"
        >
          View
        </Link>
      </div>
    </div>
  );
}

export default StationCard;
