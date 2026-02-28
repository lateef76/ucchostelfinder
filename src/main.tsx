import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Detect if user is on mobile for any initial setup
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Set viewport height fix for mobile browsers (address bar issues)
const setVhVariable = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
};

// Initial set
setVhVariable();

// Reset on resize
window.addEventListener("resize", setVhVariable);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
