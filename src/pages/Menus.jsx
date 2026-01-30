import React, { useState, useEffect } from "react";
import { menusAPI } from "../api/services";
import useStore from "../store/useStore";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Pagination from "react-bootstrap/Pagination";
import Modal from "react-bootstrap/Modal";
import Badge from "react-bootstrap/Badge";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { useTranslations } from "../hooks/useTranslations";
import Loading from "../components/ui/Loading";
import Search from "../components/search/Search";

const Menus = () => {
  const { t } = useTranslations();
  const { addNotification } = useStore();
  
  const [menus, setMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [search, setSearch] = useState("");
  const [pages, setPages] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const menusPerPage = 10;
  
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    name: { uk: "", en: "" },
    layout: 1,
    properties: {
      target: {
        type: "page",
        id: null,
        name: { uk: "", en: "" }
      }
    },
    parent_id: null,
    visibility: true
  });

  useEffect(() => {
    fetchMenus();
    fetchPages();
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

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/v1/admin/menus/pages', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Pages data:", data);
      setPages(data || []);
    } catch (error) {
      console.error("Error fetching pages:", error);
      
      // Альтернативный способ
      try {
        const altResponse = await fetch('/api/v1/pages');
        if (altResponse.ok) {
          const altData = await altResponse.json();
          console.log("Alternative pages data:", altData);
          
          if (altData.data) {
            const formattedPages = altData.data.map(page => ({
              id: page.id,
              name: page.name,
              slug: page.slug
            }));
            setPages(formattedPages);
          }
        }
      } catch (altError) {
        console.error("Alternative fetch failed:", altError);
      }
    }
  };

  const handleAddClick = () => {
    setFormData({
      name: { uk: "", en: "" },
      layout: 1,
      properties: {
        target: {
          type: "page",
          id: null,
          name: { uk: "", en: "" }
        }
      },
      parent_id: null,
      visibility: true
    });
    setFormErrors({});
    setSelectedMenu(null);
    setShowModal(true);
  };

  const handleEditClick = (menu) => {
    setFormData({
      name: menu.name || { uk: "", en: "" },
      layout: menu.layout || 1,
      properties: menu.properties || {
        target: {
          type: "page",
          id: null,
          name: { uk: "", en: "" }
        }
      },
      parent_id: menu.parent_id || null,
      visibility: menu.visibility !== false
    });
    setFormErrors({});
    setSelectedMenu(menu);
    setShowModal(true);
  };

  const handleDeleteClick = (menu) => {
    setSelectedMenu(menu);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormErrors({});
    
    console.log("Submitting form data:", formData);

    try {
      const dataToSend = {
        name: {
          uk: formData.name.uk.trim(),
          en: formData.name.en?.trim() || ""
        },
        layout: formData.layout,
        properties: {
          target: {
            type: formData.properties.target.type,
            id: formData.properties.target.type === 'page' 
              ? (formData.properties.target.id ? parseInt(formData.properties.target.id) : null)
              : null,
            name: formData.properties.target.type === 'link'
              ? formData.properties.target.name
              : {}
          }
        },
        parent_id: formData.parent_id || null,
        visibility: formData.visibility
      };

      console.log("Data to send:", dataToSend);

      if (selectedMenu) {
        await menusAPI.update(selectedMenu.id, dataToSend);
        addNotification({
          type: "success",
          message: t("dashboard.panel.menus.update.success"),
        });
      } else {
        await menusAPI.create(dataToSend);
        addNotification({
          type: "success",
          message: t("dashboard.panel.menus.create.success"),
        });
      }
      
      setShowModal(false);
      fetchMenus();
      
    } catch (error) {
      console.error("Error saving menu:", error);
      console.error("Error details:", error.response?.data);
      
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        addNotification({
          type: "error",
          message: error.response?.data?.message || error.message || t("dashboard.panel.menus.save.error"),
        });
      }
    } finally {
      setFormLoading(false);
    }
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

  const getPageName = (page) => {
    if (!page || !page.name) return `Сторінка ${page?.id || ''}`;
    
    const locale = getCurrentLocale();
    
    if (typeof page.name === 'string') {
      return page.name;
    }
    
    if (typeof page.name === 'object') {
      return page.name[locale] || page.name.uk || page.name.en || `Сторінка ${page.id}`;
    }
    
    return `Сторінка ${page.id}`;
  };

  const getTargetInfo = (menu) => {
    const target = menu.properties?.target;
    if (!target) return "Немає цілі";
    
    if (target.type === "page") {
      const pageName = getPageName({ id: target.id, name: target.name });
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

  const getSelectedPageName = (pageId) => {
    if (!pageId) return "";
    const page = pages.find(p => p.id === parseInt(pageId));
    return page ? getPageName(page) : `ID: ${pageId}`;
  };

  const indexOfLastMenu = currentPage * menusPerPage;
  const indexOfFirstMenu = indexOfLastMenu - menusPerPage;
  const currentMenus = filteredMenus.slice(indexOfFirstMenu, indexOfLastMenu);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading && !menus.length) {
    return <Loading />;
  }

  console.log(pages);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 mb-4 text-gray-800">
          {t("dashboard.panel.menus.title")}
        </h1>
        <Button variant="secondary" onClick={handleAddClick}>
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
                    <th>Макет</th>
                    <th>Ціль</th>
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
                            onClick={() => handleEditClick(menu)}
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
              <Button variant="secondary" onClick={handleAddClick}>
                {t("dashboard.panel.menus.try_new")}
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Модальное окно создания/редактирования меню */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedMenu ? t("dashboard.panel.menus.edit") : t("dashboard.panel.menus.create")}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body>
            {Object.keys(formErrors).length > 0 && (
              <Alert variant="danger">
                <ul className="mb-0">
                  {Object.entries(formErrors).map(([field, errors]) => (
                    <li key={field}>
                      <strong>{field}:</strong> {Array.isArray(errors) ? errors.join(', ') : errors}
                    </li>
                  ))}
                </ul>
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>{t("dashboard.panel.menus.name_uk")} *</Form.Label>
              <Form.Control
                type="text"
                value={formData.name.uk || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: { ...prev.name, uk: e.target.value }
                }))}
                required
                disabled={formLoading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t("dashboard.panel.menus.name_en")}</Form.Label>
              <Form.Control
                type="text"
                value={formData.name.en || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: { ...prev.name, en: e.target.value }
                }))}
                disabled={formLoading}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t("common.layout")} *</Form.Label>
                  <Form.Select
                    value={formData.layout}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      layout: parseInt(e.target.value)
                    }))}
                    required
                    disabled={formLoading}
                  >
                    <option value={1}>{t("dashboard.panel.menus.layouts.main")}</option>
                    <option value={0}>{t("dashboard.panel.menus.layouts.footer")}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t("dashboard.panel.menus.parent")}</Form.Label>
                  <Form.Select
                    value={formData.parent_id || ""}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      parent_id: e.target.value ? parseInt(e.target.value) : null
                    }))}
                    disabled={formLoading}
                  >
                    <option value="">{t("dashboard.panel.menus.no_parent")}</option>
                    {menus
                      .filter(menu => menu.id !== selectedMenu?.id)
                      .map(menu => (
                        <option key={menu.id} value={menu.id}>
                          {getMenuName(menu)}
                        </option>
                      ))
                    }
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>{t("common.target_type")} *</Form.Label>
              <div className="d-flex gap-3 mb-3">
                <Form.Check
                  type="radio"
                  id="target-page"
                  label={t("common.target_page")}
                  checked={formData.properties.target.type === "page"}
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    properties: {
                      target: {
                        type: 'page',
                        id: null,
                        name: { uk: "", en: "" }
                      }
                    }
                  }))}
                  disabled={formLoading}
                />
                <Form.Check
                  type="radio"
                  id="target-link"
                  label={t("common.target_link")}
                  checked={formData.properties.target.type === "link"}
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    properties: {
                      target: {
                        type: 'link',
                        id: '',
                        name: { uk: "", en: "" }
                      }
                    }
                  }))}
                  disabled={formLoading}
                />
              </div>
            </Form.Group>

            {formData.properties.target.type === "page" ? (
              <Form.Group className="mb-3">
                <Form.Label>{t("common.select_page")} *</Form.Label>
                <Form.Select
                  value={formData.properties.target.id || ""}
                  onChange={(e) => {
                    const pageId = e.target.value;
                    const selectedPage = pages.find(p => p.id === parseInt(pageId));
                    setFormData(prev => ({
                      ...prev,
                      properties: {
                        target: {
                          type: 'page',
                          id: pageId ? parseInt(pageId) : null,
                          name: selectedPage?.name || { uk: "", en: "" }
                        }
                      }
                    }));
                  }}
                  required={formData.properties.target.type === "page"}
                  disabled={formLoading}
                >
                  <option value="">{t("common.page_placeholder")}</option>
                  {pages.map(page => (
                    <option key={page.id} value={page.id}>
                      {getPageName(page)} (ID: {page.id})
                    </option>
                  ))}
                </Form.Select>
                {formData.properties.target.id && (
                  <Form.Text className="text-muted">
                    Обрано: {getSelectedPageName(formData.properties.target.id)}
                  </Form.Text>
                )}
              </Form.Group>
            ) : (
              <Form.Group className="mb-3">
                <Form.Label>{t("dashboard.panel.menus.link_url")} *</Form.Label>
                <Form.Control
                  type="url"
                  placeholder="https://example.com"
                  value={formData.properties.target.name?.uk || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    properties: {
                      target: {
                        ...prev.properties.target,
                        name: { uk: e.target.value, en: e.target.value }
                      }
                    }
                  }))}
                  required={formData.properties.target.type === "link"}
                  disabled={formLoading}
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="visibility-switch"
                label={formData.visibility ? t("common.visible") : t("common.hidden")}
                checked={formData.visibility}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  visibility: e.target.checked
                }))}
                disabled={formLoading}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={formLoading}>
              {t("common.cancel")}
            </Button>
            <Button variant="primary" type="submit" disabled={formLoading}>
              {formLoading && <Spinner size="sm" className="me-2" />}
              {selectedMenu ? t("common.update") : t("common.create")}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t("dashboard.panel.menus.confirm_delete")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t("dashboard.panel.menus.confirm_delete_message")} 
          <strong>{selectedMenu ? getMenuName(selectedMenu) : ''}</strong>?
          <br />
          <small className="text-muted">
            {t("dashboard.panel.menus.this_action_cannot_be_undone")}
          </small>
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