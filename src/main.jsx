import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./auth-context.jsx";
import WYPAssist from "./wyp-assist.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <WYPAssist />
    </AuthProvider>
  </React.StrictMode>
);
