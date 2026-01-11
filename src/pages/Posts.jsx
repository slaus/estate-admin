import React, { useState, useEffect } from 'react';
import { postsAPI } from '../api/services';
import { useLoading } from '../contexts/LoadingContext';
import useStore from '../store/useStore';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Pagination from 'react-bootstrap/Pagination';
import Modal from 'react-bootstrap/Modal';
import Badge from 'react-bootstrap/Badge';

const Posts = () => {
  const { showLoading, hideLoading } = useLoading();
  const { addNotification } = useStore();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 10;

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const filtered = posts.filter(post =>
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.slug.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredPosts(filtered);
    setTotalPages(Math.ceil(filtered.length / postsPerPage));
    setCurrentPage(1);
  }, [search, posts]);

  const fetchPosts = async () => {
    showLoading('Loading posts...');
    try {
      const response = await postsAPI.getAll();
      setPosts(response.data);
      addNotification({
        type: 'success',
        message: 'Posts loaded successfully'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to load posts'
      });
    } finally {
      hideLoading();
    }
  };

  const handleDeleteClick = (post) => {
    setSelectedPost(post);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPost) return;
    
    showLoading('Deleting post...');
    try {
      await postsAPI.delete(selectedPost.id);
      setPosts(posts.filter(p => p.id !== selectedPost.id));
      addNotification({
        type: 'success',
        message: 'Post deleted successfully'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to delete post'
      });
    } finally {
      hideLoading();
      setShowDeleteModal(false);
      setSelectedPost(null);
    }
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Posts</h1>
        <Button variant="primary" href="/posts/new">
          <i className="bi bi-plus-circle me-2"></i>
          Add New Post
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          {currentPosts.length > 0 ? (
            <>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Slug</th>
                    <th>Tags</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPosts.map((post) => (
                    <tr key={post.id}>
                      <td>{post.id}</td>
                      <td>
                        <strong>{post.title}</strong>
                        {post.excerpt && (
                          <div className="text-muted small">{post.excerpt}</div>
                        )}
                      </td>
                      <td>
                        <code>{post.slug}</code>
                      </td>
                      <td>
                        {post.tags && post.tags.length > 0 ? (
                          post.tags.map(tag => (
                            <Badge key={tag.id} bg="secondary" className="me-1">
                              {tag.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted">No tags</span>
                        )}
                      </td>
                      <td>
                        {new Date(post.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            href={`/posts/edit/${post.id}`}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
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
              <h5>No posts found</h5>
              <p className="text-muted">
                {search ? 'Try a different search term' : 'Start by creating your first post'}
              </p>
              <Button variant="primary" href="/posts/new">
                Create First Post
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
          Are you sure you want to delete post "
          <strong>{selectedPost?.title}</strong>"?
          This action cannot be undone.
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

export default Posts;