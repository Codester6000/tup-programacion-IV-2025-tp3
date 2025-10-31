import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@picocss/pico";
import "./index.css";
import { Layout } from "./Layout.jsx";
import { App } from "./App.jsx";
import { AuthProvider } from "./Auth.jsx";
import { BrowserRouter, Route, Routes } from "react-router";
import { Usuarios } from "./Usuarios.jsx";
import { Roles } from "./Roles.jsx";
import { Contador } from "./Contador.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<App />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="roles" element={<Roles />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
