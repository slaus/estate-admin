import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usersAPI } from "../api/services";
import useStore from "../store/useStore";
import { useAuth } from "../contexts/AuthContext";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Card from "react-bootstrap/Card";
import Pagination from "react-bootstrap/Pagination";
import Modal from "react-bootstrap/Modal";
import Badge from "react-bootstrap/Badge";
import { useTranslations } from "../hooks/useTranslations";
import Loading from "../components/Loading";
import Search from "../components/Search";

// Импортируем дефолтный аватар
import Avatar from "../assets/no-avatar.svg";

const Users = () => {
  const { t } = useTranslations();
  const { addNotification } = useStore();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return Avatar;

    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
      return avatarPath;
    }

    if (avatarPath.startsWith("/storage/")) {
      const storagePath = avatarPath.replace("/storage/", "");

      const baseUrl =
        import.meta.env.VITE_BACKEND_URL || "http://estate.test/backend/public";
      return `${baseUrl}/storage/${storagePath}`;
    }

    if (avatarPath.startsWith("/")) {
      const baseUrl =
        import.meta.env.VITE_BACKEND_URL || "http://estate.test/backend/public";
      return baseUrl + avatarPath;
    }

    return avatarPath;
  };

  useEffect(() => {
    if (
      currentUser &&
      currentUser.role !== "admin" &&
      currentUser.role !== "superadmin"
    ) {
      navigate("/");
      return;
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (
      currentUser &&
      (currentUser.role === "admin" || currentUser.role === "superadmin")
    ) {
      fetchUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        (user.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (user.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (user.phone?.toLowerCase() || "").includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
    setTotalPages(Math.ceil(filtered.length / usersPerPage));
    setCurrentPage(1);
  }, [search, users]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await usersAPI.getAll();

      if (response.success) {
        const usersWithFullAvatarUrls = (response.data || []).map((user) => ({
          ...user,
          avatar: getAvatarUrl(user.avatar),
        }));
        setUsers(usersWithFullAvatarUrls);
        addNotification({
          type: "success",
          message: "Users loaded successfully",
        });
      } else {
        setError(response.message || "Failed to load users");
        addNotification({
          type: "error",
          message: response.message || "Failed to load users",
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);

      if (error.response?.status === 403) {
        navigate("/");
        return;
      }

      setError(error.message || "Failed to load users");
      addNotification({
        type: "error",
        message: error.message || "Failed to load users",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    setLoading(true);

    try {
      const response = await usersAPI.delete(selectedUser.id);

      if (response.success) {
        setUsers(users.filter((u) => u.id !== selectedUser.id));
        addNotification({
          type: "success",
          message: "User deleted successfully",
        });
      } else {
        addNotification({
          type: "error",
          message: response.message || "Failed to delete user",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      addNotification({
        type: "error",
        message: error.message || "Failed to delete user",
      });
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setSelectedUser(null);
    }
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (
    currentUser &&
    currentUser.role !== "admin" &&
    currentUser.role !== "superadmin"
  ) {
    return null;
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
        <Button variant="secondary" onClick={() => navigate("/")}>
          {t("common.back_to_dashboard")}
        </Button>
      </div>
    );
  }

  const getUserStatus = (user) => {
    if (!user.role) {
      return { active: true, label: t("common.active")};
    }

    if (user.is_active === false) {
      return { active: false, label: t("common.inactive")};
    }

    return { active: true, label: t("common.active")};
  };

  const getUserType = (user) => {
    if (user.role) {
      return {
        label: t("roles.administrator"),
        badgeColor: "warning",
        textClass: "text-dark",
      };
    } else {
      return {
        label: t("roles.user"),
        badgeColor: "info",
        textClass: "",
      };
    }
  };

  const UserAvatar = ({ avatarUrl, name }) => {
    const [imgError, setImgError] = useState(false);

    return (
      <div className="d-flex align-items-center">
        {avatarUrl && !imgError ? (
          <img
            src={avatarUrl}
            alt={name}
            className="rounded-circle me-2"
            style={{ width: "32px", height: "32px", objectFit: "cover" }}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div
            className="rounded-circle bg-secondary me-2 d-flex align-items-center justify-content-center"
            style={{ width: "32px", height: "32px" }}
          >
            <i className="bi bi-person text-white"></i>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 mb-4 text-gray-800">
          {t("dashboard.panel.users.title")}
        </h1>
      </div>

      <Search
        search={search}
        setSearch={setSearch}
        placeholder={t("common.search")}
      />

      <Card>
        <Card.Body>
          {currentUsers.length > 0 ? (
            <>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{t("common.name")}</th>
                    <th>{t("common.email")}</th>
                    <th>{t("common.status")}</th>
                    <th>{t("common.date")}</th>
                    <th>{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => {
                    const status = getUserStatus(user);
                    const type = getUserType(user);

                    return (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <UserAvatar
                              avatarUrl={user.avatar}
                              name={user.name}
                            />
                            <div>
                              <strong>{user.name}</strong>
                            </div>
                          </div>
                        </td>
                        <td>
                          <code>
                            <a
                              href={`mailto:${user.email}`}
                              className="text-decoration-none"
                            >
                              {user.email}
                            </a>
                          </code>
                        </td>
                        <td>
                          {status.active ? (
                            <Badge bg="success">
                              <i className="bi bi-check-circle me-1"></i>
                              {status.label}
                            </Badge>
                          ) : (
                            <Badge bg="secondary">
                              <i className="bi bi-x-circle me-1"></i>
                              {status.label}
                            </Badge>
                          )}
                        </td>
                        <td>
                          <small>
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString()
                              : "—"}
                          </small>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <Button
                              variant="warning"
                              size="sm"
                              href={`/users/blacklist/${user.id}`}
                              title={t("common.blacklist")}
                            >
                              <i className="bi bi-exclamation-triangle"></i>
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              href={`/users/edit/${user.id}`}
                              title={t("common.edit")}
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteClick(user)}
                              title={t("common.delete")}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              {totalPages > 1 && (
                <div className="d-flex justify-content-center">
                  <Pagination>
                    <Pagination.First
                      onClick={() => paginate(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    />

                    {[...Array(totalPages)].map((_, i) => (
                      <Pagination.Item
                        key={i + 1}
                        active={i + 1 === currentPage}
                        onClick={() => paginate(i + 1)}
                      >
                        {i + 1}
                      </Pagination.Item>
                    ))}

                    <Pagination.Next
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last
                      onClick={() => paginate(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-people fs-1 text-muted mb-3 d-block"></i>
              <h5>
                {t("dashboard.panel.users.not_found")}
              </h5>
              <p className="text-muted">
                {search
                  ? t("dashboard.panel.users.try_found")
                  : t("dashboard.panel.users.no_user")
                }
              </p>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {t("common.confirm_delete")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t("dashboard.panel.users.delete_confirm")}
          <strong>{selectedUser?.name || selectedUser?.email}</strong>?
          <br />
          <div>
            <strong>{t("common.action_cannot_be_undone")}</strong>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            {t("common.cancel")}
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            {t("common.delete")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Users;
