import React from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useTranslations } from "../../hooks/useTranslations";

const ProfileForm = ({ 
  user, 
  profileForm, 
  errors, 
  successMessage,
  getAvatarUrl,
  onAvatarClick,
  onPasswordClick,
  onInputChange,
  onSave,
  onHide,
  loading 
}) => {
  const { t } = useTranslations();

  return (
    <>
      {successMessage && (
        <Alert variant="success" className="small py-2">
          {successMessage}
        </Alert>
      )}
      
      {errors.general && (
        <Alert variant="danger" className="small py-2">
          {errors.general}
        </Alert>
      )}
      
      <div className="text-center mb-4">
        <div className="position-relative d-inline-block">
          <img
            src={getAvatarUrl(user?.avatar)}
            alt="Avatar"
            width="120"
            height="120"
            className="rounded-circle border object-fit-cover cursor-pointer"
            onClick={onAvatarClick}
            style={{ cursor: 'pointer', objectFit: 'cover' }}
          />
          <div className="mt-2">
            <Button 
              variant="link" 
              size="sm"
              className="text-decoration-none p-0"
              onClick={onAvatarClick}
            >
              {t("auth.profile.change_avatar")}
            </Button>
          </div>
        </div>
      </div>

      <div className="text-center mb-4">
        <h6 className="mb-1">{user?.name || "User"}</h6>
        <small className="text-muted">{user?.email || "Email"}</small>
      </div>

      <Form>
        <Form.Group className="mb-3">
          <Form.Label className="small text-muted">
            {t('auth.profile.name_new')}
          </Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={profileForm.name}
            onChange={onInputChange}
            isInvalid={!!errors.name}
            placeholder={t("auth.profile.name_new")}
            className="text-center"
          />
          <Form.Control.Feedback type="invalid">
            {errors.name}
          </Form.Control.Feedback>
        </Form.Group>

        <div className="d-grid gap-2 mt-4">
          <Button 
            variant="outline-secondary" 
            onClick={onPasswordClick}
            className="d-flex align-items-center justify-content-center gap-2"
          >
            <i className="bi bi-key"></i>
            {t('auth.profile.change_password')}
          </Button>
        </div>
      </Form>
    </>
  );
};

export default ProfileForm;