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
  const [lastoNumbers, setLastoNumbers] = useState("");
  const [lastoAmount, setLastoAmount] = useState("");

  const [swertresNumbers, setSwertresNumbers] = useState("");
  const [swertresAmount, setSwertresAmount] = useState("");

  const [pick3Numbers, setPick3Numbers] = useState("");
  const [pick3Amount, setPick3Amount] = useState("");

  const [fourDNumbers, setFourDNumbers] = useState("");
  const [fourDAmount, setFourDAmount] = useState("");

  const [controlNumbers, setControlNumbers] = useState("");
  const [controlAmount, setControlAmount] = useState("");

  const [isCollectionEmpty, setIsCollectionEmpty] = useState(true);
  const [docId, setDocId] = useState(null);

  // Fetch existing data
  useEffect(() => {
    const checkCollection = async () => {
      if (isOpen) {
        const querySnapshot = await getDocs(collection(db, "loadControl"));
        if (querySnapshot.empty) {
          setIsCollectionEmpty(true);
        } else {
          setIsCollectionEmpty(false);
          const docData = querySnapshot.docs[0];
          setDocId(docData.id);

          const data = docData.data();

          // Load existing values into state
          setLastoNumbers(data.lasto?.numbers?.join(", ") || "");
          setLastoAmount(data.lasto?.amount?.toString() || "");

          setSwertresNumbers(data.swertres?.numbers?.join(", ") || "");
          setSwertresAmount(data.swertres?.amount?.toString() || "");

          setPick3Numbers(data.pick3?.numbers?.join(", ") || "");
          setPick3Amount(data.pick3?.amount?.toString() || "");

          setFourDNumbers(data.fourD60?.numbers?.join(", ") || "");
          setFourDAmount(data.fourD60?.amount?.toString() || "");

          setControlNumbers(data.controlNumbers?.numbers?.join(", ") || "");
          setControlAmount(data.controlNumbers?.amount?.toString() || "");
        }
      }
    };

    checkCollection();
  }, [isOpen]);

  const parseNumbers = (input) =>
    input
      .split(/[ ,]+/)
      .map((num) => num.trim())
      .filter((num) => num !== "" && !isNaN(num))
      .map((num) =>
        num.length > 0 ? (isNaN(num) ? num : parseInt(num, 10)) : null
      )
      .filter((num) => num !== null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loadData = {
      lasto: {
        numbers: parseNumbers(lastoNumbers),
        amount: parseInt(lastoAmount, 10) || 0,
      },
      swertres: {
        numbers: parseNumbers(swertresNumbers),
        amount: parseInt(swertresAmount, 10) || 0,
      },
      pick3: {
        numbers: parseNumbers(pick3Numbers),
        amount: parseInt(pick3Amount, 10) || 0,
      },
      fourD60: {
        numbers: parseNumbers(fourDNumbers),
        amount: parseInt(fourDAmount, 10) || 0,
      },
      ...(controlNumbers.trim() && {
        controlNumbers: {
          numbers: parseNumbers(controlNumbers),
          amount: parseInt(controlAmount, 10) || 0,
        },
      }),
      dateToday: serverTimestamp(),
    };

    try {
      if (isCollectionEmpty) {
        await addDoc(collection(db, "loadControl"), loadData);
        Swal.fire("Successful", "Data added successfully!", "success");
      } else {
        await updateDoc(doc(db, "loadControl", docId), loadData);
        Swal.fire("Successful", "Data updated successfully!", "success");
      }
      onClose();
    } catch (error) {
      Swal.fire("Error!", `${error}`, "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show" style={{ display: "block" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add/Update Load Limits</h5>
            <button
              className="btn-close"
              type="button"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              {/* Lasto */}
              <div className="mb-3">
                <label className="form-label">Lasto Load</label>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Numbers (ex: 20,29)"
                  value={lastoNumbers}
                  onChange={(e) => setLastoNumbers(e.target.value)}
                />
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  value={lastoAmount}
                  onChange={(e) => setLastoAmount(e.target.value)}
                />
              </div>

              {/* Swertres */}
              <div className="mb-3">
                <label className="form-label">Swertres Load</label>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Numbers (ex: 209,207)"
                  value={swertresNumbers}
                  onChange={(e) => setSwertresNumbers(e.target.value)}
                />
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  value={swertresAmount}
                  onChange={(e) => setSwertresAmount(e.target.value)}
                />
              </div>

              {/* Pick3 */}
              <div className="mb-3">
                <label className="form-label">Pick3 Load</label>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Numbers"
                  value={pick3Numbers}
                  onChange={(e) => setPick3Numbers(e.target.value)}
                />
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  value={pick3Amount}
                  onChange={(e) => setPick3Amount(e.target.value)}
                />
              </div>

              {/* 4D60 */}
              <div className="mb-3">
                <label className="form-label">4D60 Load</label>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Numbers"
                  value={fourDNumbers}
                  onChange={(e) => setFourDNumbers(e.target.value)}
                />
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  value={fourDAmount}
                  onChange={(e) => setFourDAmount(e.target.value)}
                />
              </div>

              {/* Control Numbers */}
              <div className="mb-3">
                <label className="form-label">
                  Control Numbers (abrupt)
                </label>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Ex: 20,209,4010"
                  value={controlNumbers}
                  onChange={(e) => setControlNumbers(e.target.value)}
                />
                <input
                  type="number"
                  className="form-control"
                  placeholder="Load Amount"
                  value={controlAmount}
                  onChange={(e) => setControlAmount(e.target.value)}
                />
              </div>

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
