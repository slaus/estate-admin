import React from "react";
import { Nav } from "react-bootstrap";
import {NavLink} from "react-router-dom";
import { useMenuItems } from "../hooks/useMenuItems";

const Sidebar = ({ userRole, onItemClick }) => {
  const role = userRole || "manager";
  const menuItems = useMenuItems(role);

  return (
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
            <span className="d-lg-inline ms-2">{item.label}</span>
          </Nav.Link>
        ))}
    </Nav>
  );
};

export default Sidebar;