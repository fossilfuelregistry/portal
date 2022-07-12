export const formatCsvNumber = (number: unknown) =>
  typeof number === "number" ? parseFloat(number.toFixed(4)) : undefined;
