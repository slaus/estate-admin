import React from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { useTranslations } from "../../hooks/useTranslations";

const PasswordForm = ({ 
  passwordForm,
  errors,
  successMessage,
  loading,
  onInputChange,
  onSave,
  onBack
}) => {
  const { t } = useTranslations();

  return (
    <Form>
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
      
      <Form.Group className="mb-3">
        <Form.Label className="small text-muted">
          {t('auth.profile.password')}
        </Form.Label>
        <Form.Control
          type="password"
          name="password_current"
          value={passwordForm.password_current}
          onChange={onInputChange}
          isInvalid={!!errors.password_current}
          placeholder={t("auth.profile.password")}
          className="text-center"
        />
        <Form.Control.Feedback type="invalid">
          {errors.password_current}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="small text-muted">
          {t('auth.profile.password_new')}
        </Form.Label>
        <Form.Control
          type="password"
          name="password"
          value={passwordForm.password}
          onChange={onInputChange}
          isInvalid={!!errors.password}
          placeholder={t("auth.profile.password_new")}
          className="text-center"
        />
        <Form.Control.Feedback type="invalid">
          {errors.password}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="small text-muted">
          {t('auth.profile.password_re')}
        </Form.Label>
        <Form.Control
          type="password"
          name="password_confirmation"
          value={passwordForm.password_confirmation}
          onChange={onInputChange}
          isInvalid={!!errors.password_confirmation}
          placeholder={t("auth.profile.password_re")}
          className="text-center"
        />
        <Form.Control.Feedback type="invalid">
          {errors.password_confirmation}
        </Form.Control.Feedback>
      </Form.Group>

      <div className="d-flex gap-2 justify-content-center mt-4">
        <Button 
          variant="secondary" 
          onClick={onBack}
          disabled={loading}
        >
          {t("common.cancel")}
        </Button>
        <Button 
          variant="primary" 
          onClick={onSave}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {t("common.loading")}
            </>
          ) : t("common.save")}
        </Button>
      </div>
    </Form>
  );
};

export default PasswordForm;