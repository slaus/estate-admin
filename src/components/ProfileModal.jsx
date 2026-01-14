import React, { useState, useRef, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { useAuth } from "../contexts/AuthContext";
import useStore from "../store/useStore";
import { useTranslations } from "../hooks/useTranslations";
import ProfileForm from "./profile/ProfileForm";
import AvatarForm from "./profile/AvatarForm";
import PasswordForm from "./profile/PasswordForm";
import Logo from '../assets/no-avatar.svg';

const ProfileModal = ({ show, onHide }) => {
  const { user, updateProfile, removeAvatar } = useAuth();
  const { notifications } = useStore();
  const { t } = useTranslations();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  
  const [activeForm, setActiveForm] = useState('profile');
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const [profileForm, setProfileForm] = useState({ name: "" });
  const [passwordForm, setPasswordForm] = useState({
    password_current: "",
    password: "",
    password_confirmation: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (show && user) {
      resetForms();
      setAvatarPreview(user.avatar);
      setProfileForm({ name: user.name || "" });
    }
  }, [show, user]);

  const resetForms = () => {
    setErrors({});
    setSuccessMessage("");
    setAvatarFile(null);
    setActiveForm('profile');
  };

  const getAvatarUrl = (avatarPath) => {
    console.log('getAvatarUrl called with:', avatarPath);
    
    if (!avatarPath || avatarPath === 'undefined' || avatarPath === 'null') {
      console.log('Returning Logo because avatarPath is falsy');
      return Logo;
    }
    
    // Если это уже полный URL
    if (avatarPath.startsWith('http') || avatarPath.startsWith('data:')) {
      console.log('Returning full URL:', avatarPath);
      return avatarPath;
    }
    
    // Если это относительный путь (начинается с /)
    if (avatarPath.startsWith('/')) {
      // Используем бекенд URL
      const backendUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://estate-backend.test';
      const fullUrl = backendUrl + avatarPath;
      console.log('Constructed URL:', fullUrl);
      return fullUrl;
    }
    
    console.log('Returning Logo as fallback');
    return Logo;
  };

  const clearError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  // Handlers
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setErrors({ avatar: t('auth.validation.invalid_image') });
      return;
    }

    if (file.size > 120 * 1024) {
      setErrors({ avatar: t('auth.validation.file_too_large') });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    setAvatarFile(file);
    clearError('avatar');
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) {
      setErrors({ avatar: t('auth.validation.select_image') });
      return;
    }

    try {
      setLoading(true);
      const data = { avatar: avatarFile };
      const result = await updateProfile(data);
      
      if (result.success) {
        if (result.user?.avatar) {
          setAvatarPreview(result.user.avatar);
          setSuccessMessage(t('auth.profile.avatar_updated'));
          setAvatarFile(null);
          
          notifications.push({ 
            type: 'success', 
            message: t('auth.profile.avatar_updated') 
          });
          
          setTimeout(() => {
            setSuccessMessage("");
            setActiveForm('profile');
          }, 2000);
        } else {
          setErrors({ avatar: 'Аватар завантажено, але не вдалося зберегти' });
          notifications.push({ 
            type: 'warning', 
            message: 'Аватар завантажено, але виникла проблема зі збереженням' 
          });
        }
      } else {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors({ avatar: result.message });
        }
      }
    } catch (error) {
      console.error("Failed to update avatar:", error);
      notifications.push({ 
        type: 'error', 
        message: t('auth.profile.avatar_updateError') 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setLoading(true);
      const result = await removeAvatar();
      
      if (result.success) {
        setAvatarPreview(null);
        setAvatarFile(null);
        setSuccessMessage(t('auth.profile.avatar_removed'));
        
        notifications.push({ 
          type: 'success', 
          message: t('auth.profile.avatar_removed') 
        });
        
        setTimeout(() => {
          setSuccessMessage("");
          setActiveForm('profile');
        }, 2000);
      } else {
        setErrors({ avatar: result.message });
      }
    } catch (error) {
      console.error("Failed to remove avatar:", error);
      notifications.push({ 
        type: 'error', 
        message: t('auth.profile.avatar_removeError') 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const result = await updateProfile(profileForm);
      
      if (result.success) {
        setSuccessMessage(t('auth.profile.updated'));
        notifications.push({ 
          type: 'success', 
          message: t('auth.profile.updated') 
        });
        
        setTimeout(() => {
          onHide();
        }, 1500);
      } else {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors({ general: result.message });
        }
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      notifications.push({ 
        type: 'error', 
        message: t('auth.profile.updateError') 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    const newErrors = {};
    
    if (!passwordForm.password_current) {
      newErrors.password_current = t('auth.profile.errors.current_err');
    }
    
    if (!passwordForm.password) {
      newErrors.password = t('auth.validation.password_required');
    }
    
    if (!passwordForm.password_confirmation) {
      newErrors.password_confirmation = t('auth.validation.password_required');
    }
    
    if (passwordForm.password && passwordForm.password_confirmation && 
        passwordForm.password !== passwordForm.password_confirmation) {
      newErrors.password_confirmation = t('auth.profile.errors.passwords');
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const result = await updateProfile(passwordForm);
      
      if (result.success) {
        setSuccessMessage(t('auth.profile.password_updated'));
        setPasswordForm({
          password_current: "",
          password: "",
          password_confirmation: "",
        });
        
        notifications.push({ 
          type: 'success', 
          message: t('auth.profile.password_updated') 
        });
        
        setTimeout(() => {
          setActiveForm('profile');
          setSuccessMessage("");
        }, 2000);
      } else {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors({ general: result.message });
        }
      }
    } catch (error) {
      console.error("Failed to update password:", error);
      notifications.push({ 
        type: 'error', 
        message: t('auth.profile.password_updateError') 
      });
    } finally {
      setLoading(false);
    }
  };

  // Render активной формы
  const renderActiveForm = () => {
    switch (activeForm) {
      case 'avatar':
        return (
          <AvatarForm
            avatarPreview={avatarPreview}
            userAvatar={user?.avatar}
            errors={errors}
            successMessage={successMessage}
            loading={loading}
            avatarFile={avatarFile}
            getAvatarUrl={getAvatarUrl}
            onAvatarClick={handleAvatarClick}
            onRemoveAvatar={handleRemoveAvatar}
            onFileChange={handleAvatarChange}
            onSave={handleSaveAvatar}
            onBack={() => setActiveForm('profile')}
            fileInputRef={fileInputRef}
          />
        );

      case 'password':
        return (
          <PasswordForm
            passwordForm={passwordForm}
            errors={errors}
            successMessage={successMessage}
            loading={loading}
            onInputChange={handlePasswordInputChange}
            onSave={handleUpdatePassword}
            onBack={() => setActiveForm('profile')}
          />
        );

      default:
        return (
          <ProfileForm
            user={user}
            profileForm={profileForm}
            errors={errors}
            successMessage={successMessage}
            getAvatarUrl={getAvatarUrl}
            onAvatarClick={() => setActiveForm('avatar')}
            onPasswordClick={() => setActiveForm('password')}
            onInputChange={handleProfileInputChange}
            onSave={handleSaveProfile}
            onHide={onHide}
            loading={loading}
          />
        );
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={() => {
        resetForms();
        onHide();
      }}
      centered
      size="sm"
      backdrop={loading ? "static" : true}
      keyboard={!loading}
    >
      <Modal.Header closeButton={!loading}>
        <Modal.Title className="h5">
          {activeForm === 'avatar' ? t("auth.profile.change_avatar") :
           activeForm === 'password' ? t("auth.profile.change_password") :
           t("auth.profile.edit")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {renderActiveForm()}
      </Modal.Body>
      {activeForm === 'profile' && (
        <Modal.Footer className="justify-content-center">
          <Button 
            variant="secondary" 
            onClick={onHide}
            disabled={loading}
          >
            {t("common.cancel")}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveProfile}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {t("common.loading")}
              </>
            ) : t("common.save")}
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default ProfileModal;