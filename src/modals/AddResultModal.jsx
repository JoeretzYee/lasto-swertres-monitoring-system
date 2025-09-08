import React, { useState, useEffect } from "react";
import {
  db,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "../firebase";
import Swal from "sweetalert2";

const AddResultModal = ({ isOpen, onClose }) => {
  const [results, setResults] = useState({
    lasto2pm: "",
    lasto5pm: "",
    lasto9pm: "",
    swertres2pm: "",
    swertres5pm: "",
    swertres9pm: "",
    pickThree: "",
    fourD60: "",
  });
  const [docId, setDocId] = useState(null); // To store the document ID for updating

  // Fetch existing results for today's date when the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchExistingResults();
    }
  }, [isOpen]);

  const fetchExistingResults = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const q = query(collection(db, "results"), where("date", "==", today));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        console.log("Fetched existing results:", docData); // Debugging log
        setResults(docData); // Populate the form with existing data
        setDocId(querySnapshot.docs[0].id); // Store the document ID for updating
      } else {
        console.log("No existing document found for today."); // Debugging log
        setResults({
          lasto2pm: "",
          lasto5pm: "",
          lasto9pm: "",
          swertres2pm: "",
          swertres5pm: "",
          swertres9pm: "",
          pickThree: "",
          fourD60: "",
        });
        setDocId(null); // No existing document, so set ID to null
      }
    } catch (error) {
      console.error("Error fetching existing results: ", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch existing results.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("Input changed:", name, value); // Debugging log
    setResults((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const data = {
        ...results,
        date: today,
        timestamp: new Date(),
      };

      // Remove empty fields so they don’t overwrite existing values
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== "")
      );

      if (docId) {
        await updateDoc(doc(db, "results", docId), filteredData);
        Swal.fire({
          title: "Updated!",
          text: "Results have been updated.",
          icon: "success",
          confirmButtonText: "OK",
        });
      } else {
        await addDoc(collection(db, "results"), data);
        Swal.fire({
          title: "Saved!",
          text: "Results have been saved.",
          icon: "success",
          confirmButtonText: "OK",
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving/updating document: ", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to save/update results.",
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
            <h5 className="modal-title">Add/Update Results for Today</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <div className="row">
                <div className="col-sm-12 col-md-4 col-lg-4">
                  <label className="form-label">Lasto 2 PM Result:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="lasto2pm"
                    value={results.lasto2pm}
                    onChange={handleChange}
                    placeholder="Enter result"
                  />
                </div>
                <div className="col-sm-12 col-md-4 col-lg-4">
                  {" "}
                  <label className="form-label">Lasto 5 PM Result:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="lasto5pm"
                    value={results.lasto5pm}
                    onChange={handleChange}
                    placeholder="Enter result"
                  />
                </div>
                <div className="col-sm-12 col-md-4 col-lg-4">
                  {" "}
                  <label className="form-label">Lasto 9 PM Result:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="lasto9pm"
                    value={results.lasto9pm}
                    onChange={handleChange}
                    placeholder="Enter result"
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="row">
                <div className="col-sm-12 col-md-4 col-lg-4">
                  <label className="form-label">Swertres 2 PM Result:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="swertres2pm"
                    value={results.swertres2pm}
                    onChange={handleChange}
                    placeholder="Enter result"
                  />
                </div>
                <div className="col-sm-12 col-md-4 col-lg-4">
                  <label className="form-label">Swertres 5 PM Result:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="swertres5pm"
                    value={results.swertres5pm}
                    onChange={handleChange}
                    placeholder="Enter result"
                  />
                </div>
                <div className="col-sm-12 col-md-4 col-lg-4">
                  <label className="form-label">Swertres 9 PM Result:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="swertres9pm"
                    value={results.swertres9pm}
                    onChange={handleChange}
                    placeholder="Enter result"
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Pick 3 Result:</label>
              <input
                type="text"
                className="form-control"
                name="pickThree"
                value={results.pickThree}
                onChange={handleChange}
                placeholder="Enter result"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="4d60" className="form-label">
                4D60 Result:
              </label>
              <input
                type="text"
                name="fourD60"
                value={results.fourD60}
                onChange={handleChange}
                placeholder="Enter result"
                className="form-control"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
            >
              {docId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddResultModal;
