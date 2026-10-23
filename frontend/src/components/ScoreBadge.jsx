/**
 * ScoreBadge.jsx
 * --------------
 * A small readiness score shown in the header on every screen.
 * It asks the backend for the score every 1.5 seconds, so when Lebo
 * categorises a transaction or generates her documents, the judges see
 * the number change live, with a "+17" pop each time it goes up.
 */

import { useEffect, useState } from "react";
import { getPassport } from "../api";

export default function ScoreBadge() {
  const [score, setScore] = useState(null); // current score
  const [gain, setGain] = useState(0);      // how much it just went up by

  useEffect(() => {
    let last = null; // previous score, to detect changes

    /** Fetch the score and compare it with the previous one. */
    async function poll() {
      try {
        const p = await getPassport();
        const s = p.readiness.score;
        if (last !== null && s > last) {
          setGain(s - last);
          setTimeout(() => setGain(0), 2500); // hide the "+17" after 2.5s
        }
        last = s;
        setScore(s);
      } catch (e) {
        // Backend not reachable: just keep the old value.
      }
    }

    poll();
    const timer = setInterval(poll, 1500);
    return () => clearInterval(timer); // stop polling if the badge is removed
  }, []);

  if (score === null) return null;

  return (
    <div className="badge">
      {gain > 0 && <span className="badge-gain">+{gain}</span>}
      {/* key={score} makes React re-create the element, which replays the pop animation */}
      <span className="badge-score" key={score}>{score}% ready</span>
    </div>
  );
}