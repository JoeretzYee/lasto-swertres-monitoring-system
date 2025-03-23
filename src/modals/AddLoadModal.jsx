import React, { useState, useEffect } from "react";
import {
  db,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  updateDoc,
} from "../firebase";
import Swal from "sweetalert2";

function AddLoadModal({ isOpen, onClose }) {
  const [load, setLoad] = useState("");
  const [controlNumbers, setControlNumbers] = useState("");
  const [controlLoad, setControlLoad] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCollectionEmpty, setIsCollectionEmpty] = useState(true);
  const [docId, setDocId] = useState(null); // To store the document ID if data exists

  // Check if the collection is empty when the modal is opened
  useEffect(() => {
    const checkCollection = async () => {
      if (isOpen) {
        const querySnapshot = await getDocs(collection(db, "loadControl"));
        if (querySnapshot.empty) {
          setIsCollectionEmpty(true);
        } else {
          setIsCollectionEmpty(false);
          // Assuming there's only one document in the collection
          const docData = querySnapshot.docs[0];
          setDocId(docData.id); // Store the document ID
          const data = docData.data();
          setLoad(data.load.toString());
          setControlNumbers(data.controlNumber?.numbers?.join(", ") || "");
          setControlLoad(data.controlNumber?.controlLoad?.toString() || "");
          setStartDate(data.controlNumber?.dateRange?.start || "");
          setEndDate(data.controlNumber?.dateRange?.end || "");
        }
      }
    };

    checkCollection();
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate if controlNumbers is provided, then controlLoad, startDate, and endDate are required
    if (controlNumbers.trim() && (!controlLoad || !startDate || !endDate)) {
      Swal.fire({
        title: "Error!",
        text: "Control Load Amount, Start Date, and End Date are required when Control Numbers are provided.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    // Parse control numbers from the input (split by space or comma)
    const numbersArray = controlNumbers
      .split(/[ ,]+/)
      .map((num) => parseInt(num.trim(), 10))
      .filter((num) => !isNaN(num));

    // Prepare the data to be saved in Firebase
    const loadData = {
      load: parseInt(load, 10),
      ...(controlNumbers.trim() && {
        controlNumber: {
          numbers: numbersArray,
          controlLoad: parseInt(controlLoad, 10),
          dateRange: {
            start: startDate,
            end: endDate,
          },
        },
      }),
      dateToday: serverTimestamp(),
    };

    try {
      if (isCollectionEmpty) {
        // Add new data if the collection is empty
        const docRef = await addDoc(collection(db, "loadControl"), loadData);
        Swal.fire({
          title: "Successful",
          text: "Data added successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
      } else {
        // Update existing data if the collection is not empty
        await updateDoc(doc(db, "loadControl", docId), loadData);
        Swal.fire({
          title: "Successful",
          text: "Data updated successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
      }
      onClose(); // Close the modal after successful submission
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: `${error}`,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show" style={{ display: "block" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add/Update Load & Control Numbers</h5>
            <button
              className="btn-close"
              type="button"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="load" className="form-label">
                  Load Amount
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="load"
                  value={load}
                  onChange={(e) => setLoad(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="controlNumbers" className="form-label">
                  Control Numbers (optional)
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="controlNumbers"
                  value={controlNumbers}
                  onChange={(e) => setControlNumbers(e.target.value)}
                />
              </div>
              {controlNumbers.trim() && (
                <>
                  <div className="mb-3">
                    <label htmlFor="controlLoad" className="form-label">
                      Control Load Amount
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="controlLoad"
                      value={controlLoad}
                      onChange={(e) => setControlLoad(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="startDate" className="form-label">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="endDate" className="form-label">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
              <button type="submit" className="btn btn-primary">
                {isCollectionEmpty ? "Submit" : "Update"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddLoadModal;
