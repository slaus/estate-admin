import React, { useState, useEffect } from "react";
import { pagesAPI } from "../api/services";
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

const Pages = () => {
  const { t } = useTranslations();
  const { addNotification } = useStore();
  const [pages, setPages] = useState([]);
  const [filteredPages, setFilteredPages] = useState([]);
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pagesPerPage = 10;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    const filtered = pages.filter(
      (page) =>
        page.title.toLowerCase().includes(search.toLowerCase()) ||
        page.slug.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredPages(filtered);
    setTotalPages(Math.ceil(filtered.length / pagesPerPage));
    setCurrentPage(1);
  }, [search, pages]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const response = await pagesAPI.getAll();
      setPages(response.data);
      addNotification({
        type: "success",
        message: "Pages loaded successfully",
      });
    } catch (error) {
      addNotification({
        type: "error",
        message: "Failed to load pages",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (page) => {
    setSelectedPage(page);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPage) return;

    setLoading(true);

    try {
      await pagesAPI.delete(selectedPage.id);
      setPages(pages.filter((p) => p.id !== selectedPage.id));
      addNotification({
        type: "success",
        message: "Page deleted successfully",
      });
    } catch (error) {
      addNotification({
        type: "error",
        message: "Failed to delete page",
      });
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setSelectedPage(null);
    }
  };

  const indexOfLastPage = currentPage * pagesPerPage;
  const indexOfFirstPage = indexOfLastPage - pagesPerPage;
  const currentPages = filteredPages.slice(indexOfFirstPage, indexOfLastPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 mb-4 text-gray-800">
          {t("dashboard.panel.pages.title")}
        </h1>
        <Button variant="secondary" href="/pages/new">
          <i className="bi bi-plus-circle me-2"></i>
          {t("dashboard.panel.pages.new")}
        </Button>
      </div>

      <Search search={search} setSearch={setSearch} />

      <Card>
        <Card.Body>
          {currentPages.length > 0 ? (
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
                  {currentPages.map((page) => (
                    <tr key={page.id} className={page?.visibility ? '' : 'off'}>
                      <td>{page.id}</td>
                      <td>
                        <strong>{page.title}</strong>
                        {page.excerpt && (
                          <div className="text-muted small">{page.excerpt}</div>
                        )}
                      </td>
                      <td><i className={`bi bi-${page?.visibility ? 'toggle-on' : 'toggle-off'}`}></i></td>
                      <td>
                        <code>{page.slug}</code>
                      </td>
                      <td>
                        {page.tags && page.tags.length > 0 ? (
                          page.tags.map((tag) => (
                            <Badge key={tag.id} bg="primary" className="me-1 small">
                              {tag.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted">{t("common.no_tags")}</span>
                        )}
                      </td>
                      <td><small>{new Date(page.created_at).toLocaleDateString()}</small></td>
                      <td>
                        <div className="btn-group" role="group">
                          <Button
                            variant="primary"
                            size="sm"
                            href={`/pages/edit/${page.id}`}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteClick(page)}
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
              <h5>{t("dashboard.panel.pages.not_found")}</h5>
              <p className="text-muted">
                {search
                  ? t("dashboard.panel.pages.try_found")
                  : t("dashboard.panel.pages.no_page")}
              </p>
              <Button variant="secondary" href="/pages/new">
                {t("dashboard.panel.pages.try_new")}
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
          Are you sure you want to delete page "
          <strong>{selectedPage?.title}</strong>"? This action cannot be undone.
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

export default Pages;
