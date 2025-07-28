export default function getTodaysDate() {
  const today = new Date();

  const todaysString = today.toISOString().split("T")[0];

  return todaysString;
}
