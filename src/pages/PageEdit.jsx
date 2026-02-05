import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { pagesAPI } from "../api/services";
import useStore from "../store/useStore";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { Tabs, Tab } from "react-bootstrap";
import { useTranslations } from "../hooks/useTranslations";
import { useSlugGenerator, validateSlug } from "../hooks/useSlugGenerator";
import Loading from "../components/ui/Loading";
import LanguageTabs from "../components/edit/LanguageTabs";
import RichTextEditor from "../components/edit/RichTextEditor";

const PageEdit = () => {
  const { t } = useTranslations();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useStore();

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeKey, setActiveKey] = useState("content");

  const slugGenerator = useSlugGenerator("");

  const [editData, setEditData] = useState({
    name: { uk: "", en: "" },
    content: { uk: "", en: "" },
    seo: {
      meta_title: { uk: "", en: "" },
      meta_description: { uk: "", en: "" },
      meta_keywords: { uk: "", en: "" },
    },
    visibility: true,
  });

  useEffect(() => {
    if (id) {
      fetchPage();
    }
  }, [id]);

  useEffect(() => {
    if (editData.name.uk) {
      slugGenerator.updateText(editData.name.uk);
    }
  }, [editData.name.uk]);

  const fetchPage = async () => {
    setLoading(true);
    try {
      const response = await pagesAPI.getOne(id);
      const page = response.data;

      setEditData({
        name: page.name || { uk: "", en: "" },
        content: page.content || { uk: "", en: "" },
        seo: page.seo || {
          meta_title: { uk: "", en: "" },
          meta_description: { uk: "", en: "" },
          meta_keywords: { uk: "", en: "" },
        },
        visibility: page.visibility !== false,
      });

      if (page.slug) {
        slugGenerator.updateSlug(page.slug);
      }
    } catch (error) {
      console.error("Error fetching page:", error);
      addNotification({
        type: "error",
        message: t("dashboard.panel.pages.errors.load_failed"),
      });
      navigate("/pages");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const slugValidation = validateSlug(slugGenerator.slug);
    if (!slugValidation.valid) {
      setErrors({ slug: [slugValidation.message] });
      setSaving(false);
      return;
    }

    const validationErrors = {};
    if (!editData.name.uk.trim()) {
      validationErrors["name.uk"] = ["Назва українською обов'язкова"];
    }
    if (!editData.content.uk?.trim()) {
      validationErrors["content.uk"] = ["Контент українською обов'язковий"];
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSaving(false);
      return;
    }

    try {
      const dataToSend = {
        slug: slugGenerator.slug,
        name: {
          uk: editData.name.uk.trim(),
          en: editData.name.en?.trim() || "",
        },
        content: {
          uk: editData.content.uk?.trim() || "",
          en: editData.content.en?.trim() || "",
        },
        seo: editData.seo,
        visibility: editData.visibility,
      };

      if (id) {
        await pagesAPI.update(id, dataToSend);
        addNotification({
          type: "success",
          message: t("dashboard.panel.pages.update.success"),
        });
      } else {
        await pagesAPI.create(dataToSend);
        addNotification({
          type: "success",
          message: t("dashboard.panel.pages.create.success"),
        });
      }

      navigate("/pages");
    } catch (error) {
      console.error("Error saving page:", error);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        addNotification({
          type: "error",
          message:
            error.response?.data?.message ||
            error.message ||
            t("dashboard.panel.pages.save.error"),
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const generateSeo = () => {
    const newSeo = { ...editData.seo };

    Object.keys(editData.name).forEach((lang) => {
      if (editData.name[lang]) {
        if (!newSeo.meta_title[lang] && editData.name[lang]) {
          newSeo.meta_title[lang] = editData.name[lang];
        }

        if (!newSeo.meta_description[lang] && editData.content[lang]) {
          const content = editData.content[lang].replace(/<[^>]*>/g, "");
          newSeo.meta_description[lang] =
            content.substring(0, 160) + (content.length > 160 ? "..." : "");
        }

        if (!newSeo.meta_keywords[lang] && editData.name[lang]) {
          const words = editData.name[lang]
            .split(" ")
            .filter((word) => word.length > 2)
            .slice(0, 5);
          newSeo.meta_keywords[lang] = words.join(", ");
        }
      }
    });

    setEditData((prev) => ({ ...prev, seo: newSeo }));
  };

  const handleSlugRegenerate = () => {
    const newSlug = slugGenerator.regenerateSlug();
    addNotification({
      type: "info",
      message: `Slug згенеровано: ${newSlug}`,
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 mb-4 text-gray-800">
          {id
            ? t("dashboard.panel.pages.edit_title")
            : t("dashboard.panel.pages.create_title")}
        </h1>
        <Button variant="secondary" onClick={() => navigate("/pages")}>
          <i className="bi bi-arrow-left me-2"></i>
          {t("common.back")}
        </Button>
      </div>

      <Form onSubmit={handleSubmit}>
        <Card className="mb-3">
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
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>{t("dashboard.panel.pages.slug")} *</Form.Label>
                  <div className="d-flex">
                    <Form.Control
                      type="text"
                      value={slugGenerator.slug}
                      onChange={(e) => slugGenerator.updateSlug(e.target.value)}
                      required
                      disabled={saving}
                      isInvalid={!!errors.slug}
                      placeholder="my-page-slug"
                    />
                    <Button
                      variant="outline-secondary"
                      className="ms-2"
                      onClick={handleSlugRegenerate}
                      disabled={saving || !editData.name.uk}
                      title="Згенерувати slug з української назви"
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                    </Button>
                  </div>
                  <Form.Text className="text-muted">
                    {t("dashboard.panel.pages.slug_help")}
                    {slugGenerator.isAutoGenerate && (
                      <span className="text-success ms-2">
                        <i className="bi bi-check-circle me-1"></i>
                        Автогенерація увімкнена
                      </span>
                    )}
                  </Form.Text>
                  <Form.Control.Feedback type="invalid">
                    {errors.slug}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>{t("common.settings")}</Form.Label>
                  <div>
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
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <Tabs
              activeKey={activeKey}
              onSelect={(e) => setActiveKey(e)}
              className="mb-3"
            >
              <Tab
                eventKey="content"
                title={t("dashboard.panel.pages.content")}
              >
                <Card className="mb-4">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0">
                      {t("dashboard.panel.pages.content")}
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <LanguageTabs>
                      {(lang) => (
                        <>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              {t("dashboard.panel.pages.title")}{" "}
                              {lang.toUpperCase()} {lang === "uk" && "*"}
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

                          <Form.Group>
                            <Form.Label>
                              {t("dashboard.panel.pages.content_label")}{" "}
                              {lang.toUpperCase()} {lang === "uk" && "*"}
                            </Form.Label>
                            <RichTextEditor
                              value={editData.content[lang] || ""}
                              onChange={(value) =>
                                setEditData((prev) => ({
                                  ...prev,
                                  content: { ...prev.content, [lang]: value },
                                }))
                              }
                              disabled={saving}
                              uploadEndpoint="/api/upload"
                            />
                            {errors[`content.${lang}`] && (
                              <Form.Control.Feedback
                                type="invalid"
                                style={{ display: "block" }}
                              >
                                {errors[`content.${lang}`]}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </>
                      )}
                    </LanguageTabs>
                  </Card.Body>
                </Card>
              </Tab>

              <Tab
                eventKey="seo"
                title={t("dashboard.panel.pages.seo_settings")}
              >
                <Card className="mb-4">
                  <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      {t("dashboard.panel.pages.seo_settings")}
                    </h5>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={generateSeo}
                      disabled={saving}
                    >
                      <i className="bi bi-magic me-1"></i>
                      {t("dashboard.panel.pages.generate_seo")}
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <LanguageTabs>
                      {(lang) => (
                        <>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Meta Title {lang.toUpperCase()}
                            </Form.Label>
                            <Form.Control
                              type="text"
                              value={editData.seo.meta_title?.[lang] || ""}
                              onChange={(e) =>
                                setEditData((prev) => ({
                                  ...prev,
                                  seo: {
                                    ...prev.seo,
                                    meta_title: {
                                      ...prev.seo.meta_title,
                                      [lang]: e.target.value,
                                    },
                                  },
                                }))
                              }
                              disabled={saving}
                            />
                            <Form.Text className="text-muted">
                              {t("dashboard.panel.pages.meta_title_help")}
                            </Form.Text>
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>
                              Meta Description {lang.toUpperCase()}
                            </Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              value={
                                editData.seo.meta_description?.[lang] || ""
                              }
                              onChange={(e) =>
                                setEditData((prev) => ({
                                  ...prev,
                                  seo: {
                                    ...prev.seo,
                                    meta_description: {
                                      ...prev.seo.meta_description,
                                      [lang]: e.target.value,
                                    },
                                  },
                                }))
                              }
                              disabled={saving}
                            />
                            <Form.Text className="text-muted">
                              {t("dashboard.panel.pages.meta_description_help")}
                            </Form.Text>
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>
                              Meta Keywords {lang.toUpperCase()}
                            </Form.Label>
                            <Form.Control
                              type="text"
                              value={editData.seo.meta_keywords?.[lang] || ""}
                              onChange={(e) =>
                                setEditData((prev) => ({
                                  ...prev,
                                  seo: {
                                    ...prev.seo,
                                    meta_keywords: {
                                      ...prev.seo.meta_keywords,
                                      [lang]: e.target.value,
                                    },
                                  },
                                }))
                              }
                              disabled={saving}
                            />
                            <Form.Text className="text-muted">
                              {t("dashboard.panel.pages.meta_keywords_help")}
                            </Form.Text>
                          </Form.Group>
                        </>
                      )}
                    </LanguageTabs>
                  </Card.Body>
                </Card>
              </Tab>
            </Tabs>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => navigate("/pages")}
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

export default PageEdit;
