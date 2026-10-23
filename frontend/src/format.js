/**
 * format.js
 * ---------
 * Tiny helpers for showing money and percentages consistently.
 * Shared by the new screens.
 */

/** Format a number as South African Rand, e.g. -1800 -> "-R1 800". */
export const rand = (n) => {
  const sign = n < 0 ? "-" : "";
  return `${sign}R${Math.abs(Math.round(n)).toLocaleString("en-ZA")}`;
};

/** Format 0.71 as "71%". */
export const pct = (n) => `${Math.round(n * 100)}%`;