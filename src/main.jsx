import React from "react";
import ReactDOM from "react-dom/client";
import { SpeedInsights } from "@vercel/speed-insights/react";
import WYPAssist from "./wyp-assist.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WYPAssist />
    <SpeedInsights />
  </React.StrictMode>
);
