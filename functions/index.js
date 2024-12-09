/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.deleteUser = functions.https.onCall(async (data, context) => {
  const { email } = data;

  try {
    // Get the user by email
    const userRecord = await admin.auth().getUserByEmail(email);

    // Delete the user from Firebase Authentication
    await admin.auth().deleteUser(userRecord.uid);

    // Optionally, delete associated data in Firestore, etc.
    await admin
      .firestore()
      .collection("bets")
      .where("user", "==", email)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => doc.ref.delete());
      });

    return { message: `User ${email} deleted successfully` };
  } catch (error) {
    throw new functions.https.HttpsError(
      "internal",
      "Error deleting user",
      error
    );
  }
});
