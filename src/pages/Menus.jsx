import React, { useState, useEffect } from "react";
import { menusAPI } from "../api/services";
import useStore from "../store/useStore";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Card from "react-bootstrap/Card";
import Pagination from "react-bootstrap/Pagination";
import Modal from "react-bootstrap/Modal";
import Badge from "react-bootstrap/Badge";
import { useTranslations } from "../hooks/useTranslations";
import Loading from "../components/Loading";
import Search from "../components/Search";

const Menus = () => {
  const { t } = useTranslations();
  const { addNotification } = useStore();
  const [menus, setMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const menusPerPage = 10;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenus();
  }, []);

  useEffect(() => {
    const filtered = menus.filter(
      (menu) =>
        menu.title.toLowerCase().includes(search.toLowerCase()) ||
        menu.slug.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredMenus(filtered);
    setTotalPages(Math.ceil(filtered.length / menusPerPage));
    setCurrentPage(1);
  }, [search, menus]);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const response = await menusAPI.getAll();
      setMenus(response.data);
      addNotification({
        type: "success",
        message: "Menus loaded successfully",
      });
    } catch (error) {
      addNotification({
        type: "error",
        message: "Failed to load menus",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (menu) => {
    setSelectedMenu(menu);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMenu) return;

    setLoading(true);

    try {
      await menusAPI.delete(selectedMenu.id);
      setMenus(menus.filter((p) => p.id !== selectedMenu.id));
      addNotification({
        type: "success",
        message: "Menu deleted successfully",
      });
    } catch (error) {
      addNotification({
        type: "error",
        message: "Failed to delete menu",
      });
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setSelectedMenu(null);
    }
  };

  const indexOfLastMenu = currentPage * menusPerPage;
  const indexOfFirstMenu = indexOfLastMenu - menusPerPage;
  const currentMenus = filteredMenus.slice(indexOfFirstMenu, indexOfLastMenu);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 mb-4 text-gray-800">
          {t("dashboard.panel.menus.title")}
        </h1>
        <Button variant="secondary" href="/menus/new">
          <i className="bi bi-plus-circle me-2"></i>
          {t("dashboard.panel.menus.new")}
        </Button>
      </div>

      <Search search={search} setSearch={setSearch} />

      <Card>
        <Card.Body>
          {currentMenus.length > 0 ? (
            <>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{t("common.title")}</th>
                    <th>{t("common.view")}</th>
                    <th>{t("common.slug")}</th>
                    <th>{t("common.tags")}</th>
                    <th>{t("common.date")}</th>
                    <th>{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMenus.map((menu) => (
                    <tr key={menu.id} className={menu?.visibility ? '' : 'off'}>
                      <td>{menu.id}</td>
                      <td>
                        <strong>{menu.title}</strong>
                        {menu.excerpt && (
                          <div className="text-muted small">{menu.excerpt}</div>
                        )}
                      </td>
                      <td><i className={`bi bi-${menu?.visibility ? 'toggle-on' : 'toggle-off'}`}></i></td>
                      <td>
                        <code>{menu.slug}</code>
                      </td>
                      <td>
                        {menu.tags && menu.tags.length > 0 ? (
                          menu.tags.map((tag) => (
                            <Badge key={tag.id} bg="primary" className="me-1 small">
                              {tag.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted">Без тегів</span>
                        )}
                      </td>
                      <td><small>{new Date(menu.created_at).toLocaleDateString()}</small></td>
                      <td>
                        <div className="btn-group" role="group">
                          <Button
                            variant="primary"
                            size="sm"
                            href={`/menus/edit/${menu.id}`}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteClick(menu)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
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
              <i className="bi bi-newspaper fs-1 text-muted mb-3 d-block"></i>
              <h5>{t("dashboard.panel.menus.not_found")}</h5>
              <p className="text-muted">
                {search
                  ? t("dashboard.panel.menus.try_found")
                  : t("dashboard.panel.menus.no_menu")}
              </p>
              <Button variant="secondary" href="/menus/new">
                {t("dashboard.panel.menus.try_new")}
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete menu "
          <strong>{selectedMenu?.title}</strong>"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Menus;
