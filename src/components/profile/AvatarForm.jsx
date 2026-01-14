import React from "react";
import { Button, Alert, Spinner } from "react-bootstrap";
import { useTranslations } from "../../hooks/useTranslations";
import Logo from '../../assets/no-avatar.svg';

const AvatarForm = ({ 
  avatarPreview,
  userAvatar,
  errors,
  successMessage,
  loading,
  avatarFile,
  getAvatarUrl,
  onAvatarClick,
  onRemoveAvatar,
  onFileChange,
  onSave,
  onBack,
  fileInputRef
}) => {
  const { t } = useTranslations();
  const currentAvatar = avatarPreview || userAvatar;

  return (
    <div className="text-center">
      <div className="position-relative d-inline-block mb-4">
        <img
          src={getAvatarUrl(currentAvatar)}
          alt="Avatar"
          width="150"
          height="150"
          className="rounded-circle border object-fit-cover"
          style={{ objectFit: 'cover' }}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept="image/*"
          className="d-none"
        />
        <Button 
          variant="primary" 
          size="sm" 
          className="position-absolute bottom-0 end-0 rounded-circle"
          onClick={onAvatarClick}
          disabled={loading}
          title={t("auth.profile.avatar_new")}
        >
          <i className="bi bi-camera"></i>
        </Button>
        {currentAvatar && currentAvatar !== Logo && (
          <Button 
            variant="danger" 
            size="sm" 
            className="position-absolute top-0 start-0 rounded-circle"
            onClick={onRemoveAvatar}
            disabled={loading}
            title={t("auth.profile.avatar_delete")}
          >
            <i className="bi bi-trash"></i>
          </Button>
        )}
      </div>
      
      {errors.avatar && (
        <Alert variant="danger" className="small py-2">
          {errors.avatar}
        </Alert>
      )}
      
      {successMessage && (
        <Alert variant="success" className="small py-2">
          {successMessage}
        </Alert>
      )}
      
      <p className="text-muted small mb-4">
        {t('auth.profile.avatar_hint')} (max 120KB)
      </p>
      
      <div className="d-flex gap-2 justify-content-center">
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
          disabled={loading || !avatarFile}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {t("common.loading")}
            </>
          ) : t("common.save")}
        </Button>
      </div>
    </div>
  );
};

export default AvatarForm;