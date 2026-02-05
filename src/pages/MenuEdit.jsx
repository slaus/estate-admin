import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { menusAPI } from "../api/services";
import useStore from "../store/useStore";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { useTranslations } from "../hooks/useTranslations";
import Loading from "../components/ui/Loading";
import LanguageTabs from "../components/edit/LanguageTabs";

const MenuEdit = () => {
  const { t } = useTranslations();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useStore();

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [pages, setPages] = useState([]);
  const [menus, setMenus] = useState([]);

  const [editData, setEditData] = useState({
    name: { uk: "", en: "" },
    layout: 1,
    properties: {
      target: {
        type: "page",
        id: null,
        name: { uk: "", en: "" },
      },
    },
    parent_id: null,
    visibility: true,
  });

  useEffect(() => {
    fetchPages();
    fetchMenus();
    if (id) {
      fetchMenu();
    }
  }, [id]);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const response = await menusAPI.getOne(id);
      const menu = response.data;

      setEditData({
        name: menu.name || { uk: "", en: "" },
        layout: menu.layout || 1,
        properties: menu.properties || {
          target: {
            type: "page",
            id: null,
            name: { uk: "", en: "" },
          },
        },
        parent_id: menu.parent_id || null,
        visibility: menu.visibility !== false,
      });
    } catch (error) {
      console.error("Error fetching menu:", error);
      addNotification({
        type: "error",
        message: t("dashboard.panel.menus.errors.load_failed"),
      });
      navigate("/menus");
    } finally {
      setLoading(false);
    }
  };

  const fetchPages = async () => {
    try {
      const response = await fetch("/api/v1/admin/menus/pages", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPages(data || []);
      } else {
        // Альтернативный запрос
        const altResponse = await fetch("/api/v1/pages");
        if (altResponse.ok) {
          const altData = await altResponse.json();
          if (altData.data) {
            const formattedPages = altData.data.map((page) => ({
              id: page.id,
              name: page.name,
              slug: page.slug,
            }));
            setPages(formattedPages);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
    }
  };

  const fetchMenus = async () => {
    try {
      const response = await menusAPI.getAll();
      setMenus(response.data || []);
    } catch (error) {
      console.error("Error fetching menus:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const validationErrors = {};
    if (!editData.name.uk.trim()) {
      validationErrors["name.uk"] = ["Назва українською обов'язкова"];
    }
    if (
      editData.properties.target.type === "page" &&
      !editData.properties.target.id
    ) {
      validationErrors["properties.target.id"] = ["Оберіть сторінку"];
    }
    if (
      editData.properties.target.type === "link" &&
      !editData.properties.target.name?.uk?.trim()
    ) {
      validationErrors["properties.target.name"] = ["Введіть URL посилання"];
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSaving(false);
      return;
    }

    try {
      const dataToSend = {
        name: {
          uk: editData.name.uk.trim(),
          en: editData.name.en?.trim() || "",
        },
        layout: editData.layout,
        properties: {
          target: {
            type: editData.properties.target.type,
            id:
              editData.properties.target.type === "page"
                ? editData.properties.target.id
                  ? parseInt(editData.properties.target.id)
                  : null
                : null,
            name:
              editData.properties.target.type === "link"
                ? editData.properties.target.name
                : {},
          },
        },
        parent_id: editData.parent_id || null,
        visibility: editData.visibility,
      };

      if (id) {
        await menusAPI.update(id, dataToSend);
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

      navigate("/menus");
    } catch (error) {
      console.error("Error saving menu:", error);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        addNotification({
          type: "error",
          message:
            error.response?.data?.message ||
            error.message ||
            t("dashboard.panel.menus.save.error"),
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const getPageName = (page) => {
    if (!page || !page.name) return `Сторінка ${page?.id || ""}`;

    if (typeof page.name === "string") {
      return page.name;
    }

    if (typeof page.name === "object") {
      return page.name.uk || page.name.en || `Сторінка ${page.id}`;
    }

    return `Сторінка ${page.id}`;
  };

  const getMenuName = (menu) => {
    if (!menu || !menu.name) return "Без назви";

    if (typeof menu.name === "string") {
      return menu.name;
    }

    if (typeof menu.name === "object") {
      return menu.name.uk || menu.name.en || "Без назви";
    }

    return "Без назви";
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 mb-4 text-gray-800">
          {id
            ? t("dashboard.panel.menus.edit")
            : t("dashboard.panel.menus.try_new")}
        </h1>
        <Button variant="secondary" onClick={() => navigate("/menus")}>
          <i className="bi bi-arrow-left me-2"></i>
          {t("common.back")}
        </Button>
      </div>

      <Form onSubmit={handleSubmit}>
        <Card>
          <Card.Body>
            {Object.keys(errors).length > 0 && (
              <Alert variant="danger" className="mb-4">
                <ul className="mb-0">
                  {Object.entries(errors).map(([field, fieldErrors]) => (
                    <li key={field}>
                      <strong>{field}:</strong>{" "}
                      {Array.isArray(fieldErrors)
                        ? fieldErrors.join(", ")
                        : fieldErrors}
                    </li>
                  ))}
                </ul>
              </Alert>
            )}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t("common.layout")} *</Form.Label>
                  <Form.Select
                    value={editData.layout}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        layout: parseInt(e.target.value),
                      }))
                    }
                    required
                    disabled={saving}
                  >
                    <option value={1}>
                      {t("dashboard.panel.menus.layouts.main")}
                    </option>
                    <option value={0}>
                      {t("dashboard.panel.menus.layouts.footer")}
                    </option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t("dashboard.panel.menus.parent")}</Form.Label>
                  <Form.Select
                    value={editData.parent_id || ""}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        parent_id: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      }))
                    }
                    disabled={saving}
                  >
                    <option value="">
                      {t("dashboard.panel.menus.no_parent")}
                    </option>
                    {menus
                      .filter((menu) => !id || menu.id !== parseInt(id))
                      .map((menu) => (
                        <option key={menu.id} value={menu.id}>
                          {getMenuName(menu)}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Card className="mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">{t("dashboard.panel.menus.name")}</h5>
              </Card.Header>
              <Card.Body>
                <LanguageTabs>
                  {(lang) => (
                    <Form.Group className="mb-3">
                      <Form.Label>
                        {t("dashboard.panel.menus.name")} {lang.toUpperCase()}{" "}
                        {lang === "uk" && "*"}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={editData.name[lang] || ""}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            name: {
                              ...prev.name,
                              [lang]: e.target.value,
                            },
                          }))
                        }
                        required={lang === "uk"}
                        disabled={saving}
                        isInvalid={!!errors[`name.${lang}`]}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`name.${lang}`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  )}
                </LanguageTabs>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">{t("common.target")}</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>{t("common.target_type")} *</Form.Label>
                  <div className="d-flex gap-3 mb-3">
                    <Form.Check
                      type="radio"
                      id="target-page"
                      label={t("common.target_page")}
                      checked={editData.properties.target.type === "page"}
                      onChange={() =>
                        setEditData((prev) => ({
                          ...prev,
                          properties: {
                            target: {
                              type: "page",
                              id: null,
                              name: { uk: "", en: "" },
                            },
                          },
                        }))
                      }
                      disabled={saving}
                    />
                    <Form.Check
                      type="radio"
                      id="target-link"
                      label={t("common.target_link")}
                      checked={editData.properties.target.type === "link"}
                      onChange={() =>
                        setEditData((prev) => ({
                          ...prev,
                          properties: {
                            target: {
                              type: "link",
                              id: null,
                              name: { uk: "", en: "" },
                            },
                          },
                        }))
                      }
                      disabled={saving}
                    />
                  </div>
                </Form.Group>

                {editData.properties.target.type === "page" ? (
                  <Form.Group className="mb-3">
                    <Form.Label>{t("common.select_page")} *</Form.Label>
                    <Form.Select
                      value={editData.properties.target.id || ""}
                      onChange={(e) => {
                        const pageId = e.target.value;
                        const selectedPage = pages.find(
                          (p) => p.id === parseInt(pageId),
                        );
                        setEditData((prev) => ({
                          ...prev,
                          properties: {
                            target: {
                              type: "page",
                              id: pageId ? parseInt(pageId) : null,
                              name: selectedPage?.name || { uk: "", en: "" },
                            },
                          },
                        }));
                      }}
                      required={editData.properties.target.type === "page"}
                      disabled={saving}
                      isInvalid={!!errors["properties.target.id"]}
                    >
                      <option value="">{t("common.page_placeholder")}</option>
                      {pages.map((page) => (
                        <option key={page.id} value={page.id}>
                          {getPageName(page)} (ID: {page.id})
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors["properties.target.id"]}
                    </Form.Control.Feedback>
                  </Form.Group>
                ) : (
                  <Form.Group className="mb-3">
                    <Form.Label>
                      {t("dashboard.panel.menus.link_url")} *
                    </Form.Label>
                    <Form.Control
                      type="url"
                      placeholder="https://example.com"
                      value={editData.properties.target.name?.uk || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          properties: {
                            target: {
                              ...prev.properties.target,
                              name: { uk: e.target.value, en: e.target.value },
                            },
                          },
                        }))
                      }
                      required={editData.properties.target.type === "link"}
                      disabled={saving}
                      isInvalid={!!errors["properties.target.name"]}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors["properties.target.name"]}
                    </Form.Control.Feedback>
                  </Form.Group>
                )}
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">{t("common.settings")}</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Check
                    type="switch"
                    id="visibility-switch"
                    label={
                      editData.visibility
                        ? t("common.visible")
                        : t("common.hidden")
                    }
                    checked={editData.visibility}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        visibility: e.target.checked,
                      }))
                    }
                    disabled={saving}
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => navigate("/menus")}
                disabled={saving}
              >
                {t("common.cancel")}
              </Button>
              <Button variant="danger" type="submit" disabled={saving}>
                {saving && <Spinner size="sm" className="me-2" />}
                {id ? t("common.update") : t("common.create")}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Form>
    </>
  );
};

export default MenuEdit;
