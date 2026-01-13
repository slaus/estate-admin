import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Offcanvas from "react-bootstrap/Offcanvas";
import Button from "react-bootstrap/Button";
import { useTranslations } from "../hooks/useTranslations";
import ProfileModal from "../components/ProfileModal";

import Logo from "../assets/logo-w.svg";
import Avatar from "../assets/no-avatar.svg";
import Sidebar from "./Sidebar";
import LoadingSpinner from "./LoadingSpinner";

const Layout = () => {
  const { user, logout} = useAuth();
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
    return (
      <LoadingSpinner/>
    );
  }

  return (
    <>
      <Container fluid>
        <div className="row">
          {/* Sidebar для десктопа */}
          <div className="col-lg-3 col-xl-2 d-none d-lg-block left-sidebar">
            <div className="d-flex flex-column">
              <div className="p-4">
                <img
                  src={Logo}
                  alt="Logo"
                  style={{ width: "100%", maxWidth: "160px" }}
                />
              </div>
              <Sidebar userRole={user?.role} onItemClick={() => {}} />
            </div>
          </div>

          {/* Основной контент */}
          <div className="col-lg-9 col-xl-10 layout">
            <div className="row">
              {/* Навбар */}
              <Navbar
                bg="light"
                variant="light"
                expand="lg"
                className="mb-4 px-3"
              >
                <Container fluid className="p-0">
                  <Button
                    variant="light"
                    onClick={() => setShowSidebar(true)}
                    className=""
                  >
                    <i className="bi bi-list"></i>
                  </Button>

                  <Nav className="ms-auto">
                    <NavDropdown
                      title={
                        <span>
                          <i className="bi bi-globe me-2"></i>
                          {locale.toUpperCase()}
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
                          <img
                            src={user?.avatar || Avatar}
                            alt={user?.name || "User"}
                            width="40"
                          />
                          <div className="d-flex flex-column gap-0">
                            <span className="user">{user?.name || "User"}</span>
                            <span className="email">
                              {user?.email || "Email"}
                            </span>
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
              <div className="col-12">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Оффканвас сайдбар для мобильных */}
      <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Sidebar userRole={user?.role} onItemClick={() => {}} />
        </Offcanvas.Body>
      </Offcanvas>

      {/* Модальное окно редактирования профиля */}
      <ProfileModal 
        show={showProfileModal}
        onHide={() => setShowProfileModal(false)}
      />
    </>
  );
};

export default Layout;