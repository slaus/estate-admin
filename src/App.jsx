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
import Menus from "./pages/Menus";
import Pages from "./pages/Pages";
import Posts from "./pages/Posts";
import Admins from "./pages/Admins";
import Users from "./pages/Users";

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
                <Route path="menus" element={<Menus />} />
                <Route path="pages" element={<Pages />} />
                <Route path="posts" element={<Posts />} />
                <Route path="admins" element={<Admins />} />
                <Route path="users" element={<Users />} />
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
