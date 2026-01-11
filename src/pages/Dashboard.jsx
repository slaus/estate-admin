import React, { useState, useEffect } from 'react';
import { publicAPI } from '../api/services';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Table from 'react-bootstrap/Table';

const Dashboard = () => {
  const [stats, setStats] = useState({
    posts: 0,
    pages: 0,
    tags: 0,
    employees: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Получаем данные параллельно
      const [postsRes, pagesRes, tagsRes, employeesRes] = await Promise.allSettled([
        publicAPI.getPosts({ limit: 5 }),
        publicAPI.getPages(),
        publicAPI.getTags(),
        publicAPI.getEmployees(),
      ]);

      const newStats = { ...stats };
      
      if (postsRes.status === 'fulfilled') {
        newStats.posts = postsRes.value.data.length;
        setRecentPosts(postsRes.value.data);
      }
      
      if (pagesRes.status === 'fulfilled') {
        newStats.pages = pagesRes.value.data.length;
      }
      
      if (tagsRes.status === 'fulfilled') {
        newStats.tags = tagsRes.value.data.length;
      }
      
      if (employeesRes.status === 'fulfilled') {
        newStats.employees = employeesRes.value.data.length;
      }
      
      setStats(newStats);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-4">Dashboard</h1>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Статистика */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card>
            <Card.Body className="text-center">
              <Card.Title>
                <i className="bi bi-newspaper fs-1 text-primary"></i>
              </Card.Title>
              <h3>{stats.posts}</h3>
              <Card.Text>Posts</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-3">
          <Card>
            <Card.Body className="text-center">
              <Card.Title>
                <i className="bi bi-file-earmark-text fs-1 text-success"></i>
              </Card.Title>
              <h3>{stats.pages}</h3>
              <Card.Text>Pages</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-3">
          <Card>
            <Card.Body className="text-center">
              <Card.Title>
                <i className="bi bi-tags fs-1 text-warning"></i>
              </Card.Title>
              <h3>{stats.tags}</h3>
              <Card.Text>Tags</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-3">
          <Card>
            <Card.Body className="text-center">
              <Card.Title>
                <i className="bi bi-people fs-1 text-info"></i>
              </Card.Title>
              <h3>{stats.employees}</h3>
              <Card.Text>Employees</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Последние посты */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Recent Posts</h5>
        </Card.Header>
        <Card.Body>
          {recentPosts.length > 0 ? (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.map((post) => (
                  <tr key={post.id}>
                    <td>{post.title}</td>
                    <td>{post.author}</td>
                    <td>{new Date(post.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted text-center mb-0">No posts found</p>
          )}
        </Card.Body>
      </Card>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Quick Actions</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3} className="mb-2">
              <a href="/posts" className="btn btn-outline-primary w-100">
                <i className="bi bi-plus-circle me-2"></i>
                Add Post
              </a>
            </Col>
            <Col md={3} className="mb-2">
              <a href="/pages" className="btn btn-outline-success w-100">
                <i className="bi bi-plus-circle me-2"></i>
                Add Page
              </a>
            </Col>
            <Col md={3} className="mb-2">
              <a href="/tags" className="btn btn-outline-warning w-100">
                <i className="bi bi-tag me-2"></i>
                Manage Tags
              </a>
            </Col>
            <Col md={3} className="mb-2">
              <a href="/settings" className="btn btn-outline-info w-100">
                <i className="bi bi-gear me-2"></i>
                Settings
              </a>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
};

export default Dashboard;