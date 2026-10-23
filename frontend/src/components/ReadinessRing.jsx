/**
 * ReadinessRing.jsx
 * -----------------
 * The big circular progress meter showing the readiness score.
 * It is drawn with SVG: a grey circle underneath and a coloured circle on
 * top whose visible length depends on the score. A CSS transition (see
 * styles.css) makes the ring animate smoothly when the score changes,
 * which is the key visual moment in the demo.
 *
 * Props:
 *   score - number from 0 to 100
 */

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // length of the full circle

/** Pick a colour for the score: green = ready, amber = getting there. */
function colourFor(score) {
  if (score >= 70) return "#1a9e5c";
  if (score >= 40) return "#e0a100";
  return "#d64545";
}

export default function ReadinessRing({ score }) {
  // How much of the circle outline to HIDE. 0 hidden = full ring.
  const offset = CIRCUMFERENCE * (1 - score / 100);

  return (
    <div className="ring">
      <svg viewBox="0 0 140 140" width="180" height="180">
        {/* Grey background track */}
        <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="#e6e9ee" strokeWidth="12" />
        {/* Coloured progress arc (rotated so it starts at the top) */}
        <circle
          className="ring-progress"
          cx="70"
          cy="70"
          r={RADIUS}
          fill="none"
          stroke={colourFor(score)}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
        />
      </svg>
      <div className="ring-label">
        <span className="ring-score">{score}%</span>
        <span className="ring-text">business ready</span>
      </div>
    </div>
  );
}