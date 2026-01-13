import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import { useTranslations } from '../hooks/useTranslations';
import Logo from '../assets/logo.svg';

const Login = () => {
  const { t } = useTranslations();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!credentials.email.trim()) {
      newErrors.email = t('auth.login.errors.required_email');
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = t('auth.login.errors.invalid_email');
    }
    
    if (!credentials.password) {
      newErrors.password = t('auth.login.errors.required_password');
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const result = await login(credentials);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setErrors({ general: result.message || t('auth.login.errors.no_entry') });
      }
    } catch (error) {
      setErrors({ 
        general: error.message || t('auth.login.errors.invalid_login')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 d-flex align-items-center justify-content-center vh-100 text-center login-page">
      <Card style={{ width: '100%', maxWidth: '320px', minWidth: '250px', border: 'none', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
        <Card.Body>
          <div className="mb-4">
            <img src={Logo} alt="Logo" width="180" />
          </div>
          <h4 className="mb-3">{t('auth.login.title')}</h4>
          {errors.general && (
            <Alert variant="danger" dismissible onClose={() => setErrors({})}>
              {errors.general}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3 form-group">
              <Form.Control
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
                placeholder={t('auth.login.email')}
                className='text-center'
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3 form-group">
              <Form.Control
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                isInvalid={!!errors.password}
                placeholder={t('auth.login.password')}
                className='text-center'
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 py-2 mb-3"
              disabled={loading}
              style={{
                backgroundColor: '#000',
                borderColor: '#000',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#000'}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {t('auth.login.enter')}
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  {t('auth.login.submit')}
                </>
              )}
            </Button>
          </Form>
          
          <div className="text-center">
            <small 
              className="text-muted" 
              style={{cursor: 'pointer'}}
              onClick={() => {/* Логика восстановления пароля */}}
            >
              {t('auth.login.forgot_password')}
            </small>
          </div>

          <div className="d-flex flex-column text-center mt-3">
            <small className="text-muted">
              superadmin@example.com / 12345678
            </small>
            <small className="text-muted">
              admin@example.com / 12345678
            </small>
            <small className="text-muted">
              manager@example.com / 12345678
            </small>
          </div>
        </Card.Body>
      </Card>

      <style>
        {`
          .form-control:focus {
            border-color: #000;
            box-shadow: 0 0 0 0.25rem rgba(0,0,0,0.25);
          }
          
          .form-control:focus + .input-group-text {
            border-color: #000;
          }
        `}
      </style>
    </div>
  );
};

export default Login;