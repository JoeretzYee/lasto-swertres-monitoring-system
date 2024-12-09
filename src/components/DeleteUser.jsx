import React, { useState } from "react";
import {
  db,
  deleteDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  getAuth,
  deleteUser,
} from "../firebase"; // Your Firebase config

function DeleteUser({ users }) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!selectedUserId) {
      alert("Please select a user to delete.");
      return;
    }

    const selectedUser = users.find((user) => user.id === selectedUserId); // Find user by ID
    if (!selectedUser) {
      alert("User not found.");
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth();
      const userToDeleteEmail = selectedUser.email;

      // Step 1: Start a batch to handle the deletion of both the user and their associated bets
      const batch = writeBatch(db);

      // Query to get all bets associated with the user (using email)
      const betsRef = collection(db, "bets");
      const userBetsQuery = query(
        betsRef,
        where("user", "==", userToDeleteEmail)
      ); // Use email in the query
      const userBetsSnapshot = await getDocs(userBetsQuery);

      // Loop through all the bets and delete them
      userBetsSnapshot.forEach((betDoc) => {
        batch.delete(doc(db, "bets", betDoc.id)); // Delete bet
      });

      // Now delete the user from the 'users' collection using the selectedUserId
      const userDocRef = doc(db, "users", selectedUserId); // Use the selectedUserId to delete the user
      batch.delete(userDocRef); // Delete user document

      // Commit the batch delete
      await batch.commit();

      // Step 2: Delete the user from Firebase Authentication
      const userRecord = await auth.getUserByEmail(userToDeleteEmail); // Get user by email
      if (userRecord) {
        await deleteUser(userRecord); // Delete user from Firebase Authentication
        console.log(
          `User with email ${userToDeleteEmail} deleted successfully from Authentication`
        );
      }

      alert("User and associated bets deleted successfully.");
    } catch (error) {
      console.error("Error deleting user and their bets:", error);
      alert("Failed to delete user and associated bets.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="form-group">
        <label htmlFor="userSelect">Select User to Delete:</label>
        <select
          id="userSelect"
          className="form-control"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
        >
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email}{" "}
              {/* Displaying email but using userId for deletion */}
            </option>
          ))}
        </select>
      </div>
      <button
        className="btn btn-danger mt-3"
        onClick={handleDelete}
        disabled={loading}
      >
        {loading ? "Deleting..." : "Delete User"}
      </button>
    </div>
  );
}

export default DeleteUser;
