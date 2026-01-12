import React, { useState, useEffect } from "react";
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Offcanvas from "react-bootstrap/Offcanvas";
import Button from "react-bootstrap/Button";
import Toast from "react-bootstrap/Toast";
import useStore from "../store/useStore";
import { useMenuTranslations } from "../hooks/useTranslations";
import { useLocale } from "../contexts/LocaleContext";

import Logo from "../assets/logo-w.svg";
import Avatar from "../assets/no-avatar.svg";

const Layout = () => {
  const { user, logout, hasPermission, userRole } = useAuth();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const { notifications, removeNotification } = useStore();
  const { tokenWillExpireSoon, formatTimeLeft } = useAuth();
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const { t, locale, changeLocale, isLoading } = useMenuTranslations(); // Получаем все из хука

  const handleLogout = async () => {
    await logout();
    navigate("/login");
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

  // Обновляем menuItems при изменении языка
  const menuItems = React.useMemo(() => [
    { path: "/", label: t("menu.dashboard"), icon: "speedometer2", visible: true },
    {
      path: "/menus",
      label: t("menu.menus"),
      icon: "menu-app",
      visible: userRole === "admin" || userRole === "superadmin",
    },
    { path: "/posts", label: t("menu.posts"), icon: "newspaper", visible: true },
    {
      path: "/pages",
      label: t("menu.pages"),
      icon: "file-earmark-text",
      visible: true,
    },
    { path: "/tags", label: t("menu.tags"), icon: "tags", visible: true },
    {
      path: "/employees",
      label: t("menu.employees"),
      icon: "people",
      visible: true,
    },
    {
      path: "/testimonials",
      label: t("menu.testimonials"),
      icon: "chat-quote",
      visible: true,
    },
    {
      path: "/partners",
      label: t("menu.partners"),
      icon: "building",
      visible: true,
    },
    {
      path: "/users",
      label: t("menu.users"),
      icon: "people-fill",
      visible: userRole === "admin" || userRole === "superadmin",
    },
    {
      path: "/settings",
      label: t("menu.settings"),
      icon: "gear",
      visible: userRole === "admin" || userRole === "superadmin",
    },
  ], [t, userRole]); // Зависимость от t и userRole

  // Функция для переключения языка
  const handleLanguageChange = async (newLocale) => {
    await changeLocale(newLocale);
    // Принудительное обновление компонента
    // Не нужно - React сам перерендерит из-за изменения состояния
  };

  // Показываем индикатор загрузки если переводы еще не загружены
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading translations...</span>
        </div>
      </div>
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
              <Nav className="flex-column">
                {menuItems
                  .filter((item) => item.visible)
                  .map((item) => (
                    <Nav.Link
                      key={item.path}
                      as={NavLink}
                      to={item.path}
                      className={({ isActive }) =>
                        `d-flex align-items-center mb-2 ${
                          isActive ? "active" : ""
                        }`
                      }
                    >
                      <i className={`bi bi-${item.icon}`}></i>
                      <span className="d-lg-inline ms-2">{item.label}</span>
                    </Nav.Link>
                  ))}
              </Nav>
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
                    {/* Селектор языка с обработкой клика */}
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
                            src={Avatar}
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
                      <NavDropdown.Item as={Link} to="#">
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
          <Nav className="flex-column">
            {menuItems
              .filter((item) => item.visible)
              .map((item) => (
                <Nav.Link
                  key={item.path}
                  as={NavLink}
                  to={item.path}
                  className="d-flex align-items-center mb-2"
                  onClick={() => setShowSidebar(false)}
                >
                  <i className={`bi bi-${item.icon} me-2`}></i>
                  {item.label}
                </Nav.Link>
              ))}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Layout;