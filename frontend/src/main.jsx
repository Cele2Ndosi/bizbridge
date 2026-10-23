/**
 * main.jsx
 * --------
 * The entry point. Mounts the React app into index.html and loads
 * our stylesheet.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);