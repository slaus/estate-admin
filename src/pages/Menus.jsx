import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { menusAPI } from "../api/services";
import useStore from "../store/useStore";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Pagination from "react-bootstrap/Pagination";
import Modal from "react-bootstrap/Modal";
import Badge from "react-bootstrap/Badge";
import { useTranslations } from "../hooks/useTranslations";
import Loading from "../components/ui/Loading";
import Search from "../components/search/Search";

const Menus = () => {
  const { t } = useTranslations();
  const navigate = useNavigate();
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
    if (!menus) return;
    
    const filtered = menus.filter((menu) => {
      const menuTitle = getMenuName(menu);
      const menuId = menu.id?.toString() || "";
      
      return (
        menuTitle.toLowerCase().includes(search.toLowerCase()) ||
        menuId.includes(search)
      );
    });
    
    setFilteredMenus(filtered);
    setTotalPages(Math.ceil(filtered.length / menusPerPage));
    setCurrentPage(1);
  }, [search, menus]);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const response = await menusAPI.getAll();
      setMenus(response.data || []);
    } catch (error) {
      console.error("Error fetching menus:", error);
      addNotification({
        type: "error",
        message: t("dashboard.panel.menus.errors.load_failed"),
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
      setMenus(menus.filter((m) => m.id !== selectedMenu.id));
      addNotification({
        type: "success",
        message: t("dashboard.panel.menus.delete.success"),
      });
    } catch (error) {
      addNotification({
        type: "error",
        message: t("dashboard.panel.menus.delete.error"),
      });
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setSelectedMenu(null);
    }
  };

  const getCurrentLocale = () => {
    return localStorage.getItem("locale") || "uk";
  };

  const getMenuName = (menu) => {
    const locale = getCurrentLocale();
    return menu.name?.[locale] || menu.name?.uk || menu.name?.en || "Без назви";
  };

  const getTargetInfo = (menu) => {
    const target = menu.properties?.target;
    if (!target) return "Немає цілі";
    
    if (target.type === "page") {
      const locale = getCurrentLocale();
      const pageName = target.name?.[locale] || target.name?.uk || target.name?.en || `ID: ${target.id}`;
      return `Сторінка: ${pageName}`;
    } else if (target.type === "link") {
      const locale = getCurrentLocale();
      const linkName = target.name?.[locale] || target.name?.uk || target.name?.en || target.name || "#";
      return `Посилання: ${linkName}`;
    }
    
    return "Невідома ціль";
  };

  const getLayoutName = (layout) => {
    if (layout === 0) return "Футер";
    if (layout === 1) return "Головне";
    return "Невідомо";
  };

  const indexOfLastMenu = currentPage * menusPerPage;
  const indexOfFirstMenu = indexOfLastMenu - menusPerPage;
  const currentMenus = filteredMenus.slice(indexOfFirstMenu, indexOfLastMenu);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading && !menus.length) {
    return <Loading />;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 mb-4 text-gray-800">
          {t("dashboard.panel.menus.title")}
        </h1>
        <Button variant="secondary" onClick={() => navigate("/menus/new")}>
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
                  <tr className="small">
                    <th>ID</th>
                    <th>{t("common.title")}</th>
                    <th>{t("common.layout")}</th>
                    <th>{t("common.target")}</th>
                    <th>{t("common.view")}</th>
                    <th>{t("common.date")}</th>
                    <th>{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMenus.map((menu) => (
                    <tr key={menu.id} className={menu?.visibility ? '' : 'off'}>
                      <td>{menu.id}</td>
                      <td>
                        <strong>{getMenuName(menu)}</strong>
                        {menu.parent_id && (
                          <div className="text-muted small">
                            Батьківське: {menu.parent_id}
                          </div>
                        )}
                      </td>
                      <td>
                        <Badge bg="info">
                          {getLayoutName(menu.layout)}
                        </Badge>
                      </td>
                      <td>
                        <small>{getTargetInfo(menu)}</small>
                      </td>
                      <td>
                        <i className={`bi bi-${menu?.visibility ? 'toggle-on text-success' : 'toggle-off text-secondary'}`}></i>
                      </td>
                      <td>
                        <small>{new Date(menu.created_at).toLocaleDateString()}</small>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(`/menus/edit/${menu.id}`)}
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
                <div className="d-flex justify-content-center mt-4">
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
              <i className="bi bi-menu-button-wide fs-1 text-muted mb-3 d-block"></i>
              <h5>{t("dashboard.panel.menus.not_found")}</h5>
              <p className="text-muted">
                {search
                  ? t("dashboard.panel.menus.no_results")
                  : t("dashboard.panel.menus.no_menu")}
              </p>
              <Button variant="secondary" onClick={() => navigate("/menus/new")}>
                {t("dashboard.panel.menus.try_new")}
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Модальное окно удаления */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">{t("common.confirm_delete")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t("common.action_before")} 
          <strong>{selectedMenu ? getMenuName(selectedMenu) : ''}</strong>
          {t("common.action_after")}
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

export default Menus;