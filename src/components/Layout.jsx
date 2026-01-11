import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from 'react-bootstrap/Button';
import Toast from 'react-bootstrap/Toast';
import useStore from '../store/useStore';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const { notifications, removeNotification } = useStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: 'speedometer2' },
    { path: '/posts', label: 'Posts', icon: 'newspaper' },
    { path: '/pages', label: 'Pages', icon: 'file-earmark-text' },
    { path: '/tags', label: 'Tags', icon: 'tags' },
    { path: '/employees', label: 'Employees', icon: 'people' },
    { path: '/testimonials', label: 'Testimonials', icon: 'chat-quote' },
    { path: '/partners', label: 'Partners', icon: 'building' },
    { path: '/menus', label: 'Menus', icon: 'menu-app' },
    { path: '/settings', label: 'Settings', icon: 'gear' },
  ];

  return (
    <>
      {/* Навбар */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container fluid>
          <Button 
            variant="outline-light" 
            onClick={() => setShowSidebar(true)}
            className="me-2"
          >
            <i className="bi bi-list"></i>
          </Button>
          
          <Navbar.Brand as={Link} to="/">
            <i className="bi bi-house me-2"></i>
            Estate Admin
          </Navbar.Brand>
          
          <Nav className="ms-auto">
            <NavDropdown
              title={
                <>
                  <i className="bi bi-person-circle me-1"></i>
                  {user?.name || 'User'}
                </>
              }
              align="end"
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

      <Container fluid>
        <div className="row">
          {/* Sidebar для десктопа */}
          <div className="col-lg-2 d-none d-lg-block">
            <div className="card">
              <div className="card-body">
                <Nav className="flex-column">
                  {menuItems.map((item) => (
                    <Nav.Link 
                      key={item.path}
                      as={Link} 
                      to={item.path}
                      className="d-flex align-items-center mb-2"
                    >
                      <i className={`bi bi-${item.icon} me-2`}></i>
                      {item.label}
                    </Nav.Link>
                  ))}
                </Nav>
              </div>
            </div>
          </div>

          {/* Основной контент */}
          <div className="col-lg-10">
            <Outlet />
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
            {menuItems.map((item) => (
              <Nav.Link 
                key={item.path}
                as={Link} 
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

      {/* Уведомления */}
      <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 11 }}>
        {notifications.map((notification) => (
          <Toast 
            key={notification.id} 
            onClose={() => removeNotification(notification.id)}
            delay={5000} 
            autohide
            className="mb-2"
          >
            <Toast.Header>
              <strong className="me-auto">
                {notification.type === 'error' ? 'Error' : 'Success'}
              </strong>
            </Toast.Header>
            <Toast.Body>{notification.message}</Toast.Body>
          </Toast>
        ))}
      </div>
    </>
  );
};

export default Layout;