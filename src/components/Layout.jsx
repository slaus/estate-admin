import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Button from "react-bootstrap/Button";
import { useTranslations } from "../hooks/useTranslations";
import ProfileModal from "../components/ProfileModal";

import Avatar from "../assets/no-avatar.svg";
import Sidebar from "./Sidebar";
import Loading from "./Loading";

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { tokenWillExpireSoon, formatTimeLeft } = useAuth();
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const { locale, changeLocale, isLoading } = useTranslations();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  useEffect(() => {
    const checkExpiry = () => {
      if (tokenWillExpireSoon()) {
        setShowExpiryWarning(true);
      } else {
        setShowExpiryWarning(false);
      }
    };

    const interval = setInterval(checkExpiry, 30000);
    checkExpiry();

    return () => clearInterval(interval);
  }, [tokenWillExpireSoon]);

  const handleLanguageChange = async (newLocale) => {
    await changeLocale(newLocale);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <div className="d-flex">
        <Sidebar
          userRole={user?.role}
          onItemClick={() => {}}
          showSidebar={showSidebar}
        />
        <div className="layout">
          <Navbar
            bg="light"
            variant="light"
            expand="lg"
            className="navbar navbar-expand topbar mb-4 static-top shadow"
          >
            <Container fluid className="p-0 px-3">
              <Button
                variant="light"
                onClick={() => setShowSidebar(!showSidebar)}
                className="d-none d-md-block"
              >
                <i className="bi bi-list"></i>
              </Button>

              <Nav className="ms-auto">
                <NavDropdown
                  title={
                    <span>
                      <i className="bi bi-globe"></i>
                    </span>
                  }
                  align="end"
                  className="me-3"
                >
                  <NavDropdown.Item onClick={() => handleLanguageChange("en")}>
                    English
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => handleLanguageChange("uk")}>
                    Українська
                  </NavDropdown.Item>
                </NavDropdown>

                <NavDropdown
                  title={
                    <div className="d-flex align-items-center gap-2 menu">
                      <div className="avatar">
                        <img
                          src={user?.avatar || Avatar}
                          alt={user?.name || "User"}
                          width="35"
                        />
                      </div>
                      <div className="d-flex flex-column gap-0">
                        <span className="user">{user?.name || "User"}</span>
                        <span className="email">{user?.email || "Email"}</span>
                      </div>
                    </div>
                  }
                >
                  <NavDropdown.Item onClick={handleProfileClick}>
                    <i className="bi bi-person me-2"></i>
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Container>
          </Navbar>

          <Container fluid>
            <Outlet />
          </Container>
        </div>
      </div>

      <ProfileModal
        show={showProfileModal}
        onHide={() => setShowProfileModal(false)}
      />
    </>
  );
};

export default Layout;
