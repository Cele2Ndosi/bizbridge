/**
 * App.jsx
 * -------
 * The app shell: a header (with the live score badge) and a row of tabs.
 * Whichever tab is active decides which screen is shown. Each screen
 * reloads fresh data when you switch to it.
 */

import { useState } from "react";
import ScoreBadge from "./components/ScoreBadge";
import Passport from "./screens/Passport";
import GetPaid from "./screens/GetPaid";
import Bookkeeping from "./screens/Bookkeeping";
import Procurement from "./screens/Procurement";
import Opportunities from "./screens/Opportunities";

// The tabs, in demo order.
const TABS = [
  { id: "passport", label: "Passport" },
  { id: "getpaid", label: "Get Paid" },
  { id: "bookkeeping", label: "Books" },
  { id: "procurement", label: "Procurement" },
  { id: "opportunities", label: "Contracts" },
];

export default function App() {
  // Which screen is showing right now.
  const [screen, setScreen] = useState("passport");

  return (
    <div className="app">
      <header className="header">
        <span className="logo">FNB</span>
        <span>BizBridge</span>
        <ScoreBadge />
      </header>

      <nav className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={screen === tab.id ? "tab active" : "tab"}
            onClick={() => setScreen(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="content">
        {screen === "passport" && <Passport />}
        {screen === "getpaid" && <GetPaid onNavigate={setScreen} />}
        {screen === "bookkeeping" && <Bookkeeping />}
        {screen === "procurement" && <Procurement />}
        {screen === "opportunities" && <Opportunities />}
      </main>
    </div>
  );
}