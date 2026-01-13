import React from "react";
import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { useMenuItems } from "../hooks/useMenuItems";
import Logo from "../assets/logo-w.svg";

const Sidebar = ({ userRole, onItemClick, showSidebar }) => {
  const role = userRole || "manager";
  const menuItems = useMenuItems(role);

  return (
    <div className={`left-sidebar ${showSidebar ? 'mobile' : ''}`}>
      <div className="logo">
        <img
          src={Logo}
          alt="Logo"
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
                `d-flex align-items-center mb-2 ${isActive ? "active" : ""}`
              }
              onClick={onItemClick}
            >
              <i className={`bi bi-${item.icon}`}></i>
              <span>{item.label}</span>
            </Nav.Link>
          ))}
      </Nav>
    </div>
  );
};

export default Sidebar;
