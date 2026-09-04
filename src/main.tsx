import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";

import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#3A86B8",
          colorInfo: "#3A86B8",
          colorSuccess: "#3A86B8",
          colorWarning: "#F4B942",
          colorText: "#263238",
          colorTextSecondary: "#607D8B",
          colorBorder: "#DCE8EE",
          colorBgLayout: "#F5FAFC",
          colorBgContainer: "#FFFFFF",
          borderRadius: 10,
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);