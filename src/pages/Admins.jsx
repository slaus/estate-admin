import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminsAPI } from "../api/services";
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

const Admins = () => {
  const { t } = useTranslations();
  const { addNotification } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const adminsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return Avatar;
    
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
      return avatarPath;
    }
    
    if (avatarPath.startsWith('/storage/')) {
      const storagePath = avatarPath.replace('/storage/', '');
      
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://estate.test/backend/public';
      return `${baseUrl}/storage/${storagePath}`;
    }
    
    // Если путь просто начинается с /, добавляем базовый URL
    if (avatarPath.startsWith('/')) {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://estate.test/backend/public';
      return baseUrl + avatarPath;
    }
    
    return avatarPath;
  };

  // Проверяем права при монтировании компонента
  useEffect(() => {
    if (user && user.role !== 'superadmin') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.role === 'superadmin') {
      fetchAdmins();
    }
  }, [user]);

  useEffect(() => {
    const filtered = admins.filter(
      (admin) =>
        (admin.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (admin.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (admin.role?.toLowerCase() || '').includes(search.toLowerCase())
    );
    setFilteredAdmins(filtered);
    setTotalPages(Math.ceil(filtered.length / adminsPerPage));
    setCurrentPage(1);
  }, [search, admins]);

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await adminsAPI.getAll();
      
      if (response.success) {
        const adminsWithFullAvatarUrls = (response.data || []).map(admin => ({
          ...admin,
          avatar: getAvatarUrl(admin.avatar)
        }));
        setAdmins(adminsWithFullAvatarUrls);
        addNotification({
          type: "success",
          message: "Admins loaded successfully",
        });
      } else {
        setError(response.message || "Failed to load admins");
        addNotification({
          type: "error",
          message: response.message || "Failed to load admins",
        });
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      
      if (error.response?.status === 403) {
        navigate('/');
        return;
      }
      
      setError(error.message || "Failed to load admins");
      addNotification({
        type: "error",
        message: error.message || "Failed to load admins",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (admin) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAdmin) return;

    setLoading(true);

    try {
      const response = await adminsAPI.delete(selectedAdmin.id);
      
      if (response.success) {
        setAdmins(admins.filter((p) => p.id !== selectedAdmin.id));
        addNotification({
          type: "success",
          message: "Admin deleted successfully",
        });
      } else {
        addNotification({
          type: "error",
          message: response.message || "Failed to delete admin",
        });
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      addNotification({
        type: "error",
        message: error.message || "Failed to delete admin",
      });
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setSelectedAdmin(null);
    }
  };

  const indexOfLastAdmin = currentPage * adminsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage;
  const currentAdmins = filteredAdmins.slice(indexOfFirstAdmin, indexOfLastAdmin);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Если нет прав, не рендерим компонент
  if (user && user.role !== 'superadmin') {
    return null;
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
        <Button variant="secondary" onClick={() => navigate('/')}>
          {t("common.back_to_dashboard")}
        </Button>
      </div>
    );
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'superadmin': return 'danger';
      case 'admin': return 'success';
      case 'manager': return 'secondary';
      default: return 'info';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'superadmin': return t("roles.superadmin");
      case 'admin': return t("roles.admin");
      case 'manager': return t("roles.manager");
      default: return t("roles.user");
    }
  };

  const AdminAvatar = ({ avatarUrl, name }) => {
    const [imgError, setImgError] = useState(false);

    return (
      <div className="d-flex align-items-center">
        {avatarUrl && !imgError ? (
          <img 
            src={avatarUrl} 
            alt={name}
            className="rounded-circle me-2"
            style={{ width: '32px', height: '32px', objectFit: 'cover' }}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="rounded-circle bg-secondary me-2 d-flex align-items-center justify-content-center"
               style={{ width: '32px', height: '32px' }}>
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
          {t("dashboard.panel.admins.title")}
        </h1>
        <Button variant="secondary" href="/admins/new">
          <i className="bi bi-plus-circle me-2"></i>
          {t("dashboard.panel.admins.new")}
        </Button>
      </div>

      <Search 
        search={search} 
        setSearch={setSearch} 
        placeholder={t("common.search")}
      />

      <Card>
        <Card.Body>
          {currentAdmins.length > 0 ? (
            <>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{t("common.name")}</th>
                    <th>{t("common.email")}</th>
                    <th>{t("common.role")}</th>
                    <th>{t("common.date")}</th>
                    <th>{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAdmins.map((admin) => (
                    <tr key={admin.id}>
                      <td>{admin.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <AdminAvatar avatarUrl={admin.avatar} name={admin.name} />
                          <div>
                            <strong>{admin.name}</strong>
                          </div>
                        </div>
                      </td>
                      <td>
                        <code><a href={`mailto:${admin.email}`} className="text-decoration-none">{admin.email}</a></code>
                      </td>
                      <td>
                        <Badge bg={getRoleBadgeColor(admin.role)}>
                          {getRoleLabel(admin.role)}
                        </Badge>
                      </td>
                      <td>
                        <small>
                          {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : '—'}
                        </small>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <Button
                            variant="primary"
                            size="sm"
                            href={`/admins/edit/${admin.id}`}
                            title={t("common.edit")}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          {user.id !== admin.id && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteClick(admin)}
                              title={t("common.delete")}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
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
              <i className="bi bi-people-fill fs-1 text-muted mb-3 d-block"></i>
              <h5>{t("dashboard.panel.admins.not_found")}</h5>
              <p className="text-muted">
                {search
                  ? t("dashboard.panel.admins.try_found")
                  : t("dashboard.panel.admins.no_admin")
                }
              </p>
              <Button variant="secondary" href="/admins/new">
                {t("dashboard.panel.admins.try_new")}
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t("common.confirm_delete")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t("dashboard.panel.admins.delete_confirm")}
          <strong>{selectedAdmin?.name || selectedAdmin?.email}</strong>?
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

export default Admins;