import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppProvider } from "./context/AppContext";
import "./styles/global.css";
import { fadeOnHeaderOverlap } from "./utils/fadeOnHeaderOverlap";

fadeOnHeaderOverlap('.nav', 'fade-out-on-header', 30);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
