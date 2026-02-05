import React, { useState, useEffect } from "react";
import { postsAPI } from "../api/services";
import useStore from "../store/useStore";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Card from "react-bootstrap/Card";
import Pagination from "react-bootstrap/Pagination";
import Modal from "react-bootstrap/Modal";
import Badge from "react-bootstrap/Badge";
import { useTranslations } from "../hooks/useTranslations";
import Loading from "../components/ui/Loading";
import Search from "../components/search/Search";

const Posts = () => {
  const { t } = useTranslations();
  const { addNotification } = useStore();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 10;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.slug.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredPosts(filtered);
    setTotalPages(Math.ceil(filtered.length / postsPerPage));
    setCurrentPage(1);
  }, [search, posts]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await postsAPI.getAll();
      setPosts(response.data);
      addNotification({
        type: "success",
        message: "Posts loaded successfully",
      });
    } catch (error) {
      addNotification({
        type: "error",
        message: "Failed to load posts",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (post) => {
    setSelectedPost(post);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPost) return;

    setLoading(true);

    try {
      await postsAPI.delete(selectedPost.id);
      setPosts(posts.filter((p) => p.id !== selectedPost.id));
      addNotification({
        type: "success",
        message: "Post deleted successfully",
      });
    } catch (error) {
      addNotification({
        type: "error",
        message: "Failed to delete post",
      });
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setSelectedPost(null);
    }
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 mb-4 text-gray-800">
          {t("dashboard.panel.posts.title")}
        </h1>
        <Button variant="secondary" href="/posts/new">
          <i className="bi bi-plus-circle me-2"></i>
          {t("dashboard.panel.posts.new")}
        </Button>
      </div>

      <Search search={search} setSearch={setSearch} />

      <Card>
        <Card.Body>
          {currentPosts.length > 0 ? (
            <>
              <Table hover responsive>
                <thead>
                  <tr className="small">
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
                  {currentPosts.map((post) => (
                    <tr key={post.id} className={post?.visibility ? '' : 'off'}>
                      <td>{post.id}</td>
                      <td>
                        <strong>{post.title}</strong>
                        {post.excerpt && (
                          <div className="text-muted small">
                            {post.excerpt.slice(0, 35)}
                            {post.excerpt.length > 35 && '...'}
                          </div>
                        )}
                      </td>
                      <td><i className={`bi bi-${post?.visibility ? 'toggle-on' : 'toggle-off'}`}></i></td>
                      <td>
                        <code>{post.slug}</code>
                      </td>
                      <td>
                        {post.tags && post.tags.length > 0 ? (
                          post.tags.map((tag) => (
                            <Badge key={tag.id} bg="primary" className="me-1 small">
                              {tag.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted small">{t("common.no_tags")}</span>
                        )}
                      </td>
                      <td><small>{new Date(post.created_at).toLocaleDateString()}</small></td>
                      <td>
                        <div className="btn-group" role="group">
                          <Button
                            variant="primary"
                            size="sm"
                            href={`/posts/edit/${post.id}`}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteClick(post)}
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
              <h5>{t("dashboard.panel.posts.not_found")}</h5>
              <p className="text-muted">
                {search
                  ? t("dashboard.panel.posts.try_found")
                  : t("dashboard.panel.posts.no_post")}
              </p>
              <Button variant="secondary" href="/posts/new">
                {t("dashboard.panel.posts.try_new")}
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">{t("common.confirm_delete")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t("common.action_before_post")}
          <strong>{selectedPost?.title}</strong>
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

export default Posts;
