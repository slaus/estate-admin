// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import { LocaleProvider } from "./contexts/LocaleContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Posts from "./pages/Posts";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function App() {
  return (
    <LocaleProvider>
      <Router>
        <AuthProvider>
          <LoadingProvider>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="posts" element={<Posts />} />
              </Route>

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </LoadingProvider>
        </AuthProvider>
      </Router>
    </LocaleProvider>
  );
}

export default App;
