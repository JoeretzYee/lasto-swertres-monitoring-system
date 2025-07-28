export default function formatCommaNumber(number) {
  if (isNaN(number)) return "0";

  return number.toLocaleString("en-US");
}
