import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useAuth } from "../contexts/AuthContext";
import useStore from "../store/useStore";
import { useTranslations } from "../hooks/useTranslations";

import Logo from '../assets/no-avatar.svg';

const ProfileModal = ({ show, onHide }) => {
  const { user, updateProfile } = useAuth();
  const { notifications } = useStore();
  const { t } = useTranslations();
  const [errors, setErrors] = useState({});
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
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

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileForm);
      onHide();
      notifications.push({ 
        type: 'success', 
        message: t('auth.profile.updated') 
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      notifications.push({ 
        type: 'error', 
        message: t('auth.profile.updateError') 
      });
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide}
      centered
      size="sm"
    >
      <Modal.Header closeButton>
        <Modal.Title className="h5">
          {t("auth.profile.edit")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-4">
          <div className="position-relative d-inline-block">
            <img
              src={user?.avatar || Logo}
              alt="Avatar"
              width="100"
              height="100"
              className="rounded-circle border"
            />
            <Button 
              variant="light" 
              size="sm" 
              className="position-absolute bottom-0 end-0 rounded-circle"
              title={t("auth.profile.avatar_new")}
            >
              <i className="bi bi-camera"></i>
            </Button>
            <Button 
              variant="light" 
              size="sm" 
              className="position-absolute top-0 start-0 rounded-circle"
              title={t("auth.profile.avatar_delete")}
            >
              <i className="bi bi-trash"></i>
            </Button>
          </div>
        </div>

        <div className="d-flex justify-content-center align-items-center gap-2 text-center mb-4">
          <div className="d-flex flex-column gap-0">
            <b>{user?.name || "User"}</b>
            <small>{user?.email || "Email"}</small>
          </div>
        </div>

        <Form>
          <Form.Group className="mb-3 form-group">
            <Form.Control
              type="password"
              name="password"
              value={profileForm.password}
              onChange={handleInputChange}
              isInvalid={!!errors.password}
              placeholder={t("auth.profile.password")}
              className='text-center'
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3 form-group">
            <Form.Control
              type="name"
              name="name_new"
              value={profileForm.name_new}
              onChange={handleInputChange}
              isInvalid={!!errors.name_new}
              placeholder={t("auth.profile.name_new")}
              className='text-center'
            />
            <Form.Control.Feedback type="invalid">
              {errors.name_new}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3 form-group">
            <Form.Control
              type="password"
              name="password_new"
              value={profileForm.password_new}
              onChange={handleInputChange}
              isInvalid={!!errors.password_new}
              placeholder={t("auth.profile.password_new")}
              className='text-center'
            />
            <Form.Control.Feedback type="invalid">
              {errors.password_new}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3 form-group">
            <Form.Control
              type="password"
              name="password_re"
              value={profileForm.password_re}
              onChange={handleInputChange}
              isInvalid={!!errors.password_re}
              placeholder={t("auth.profile.password_re")}
              className='text-center'
            />
            <Form.Control.Feedback type="invalid">
              {errors.password_re}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button 
          variant="secondary" 
          onClick={onHide}
        >
          {t("common.cancel")}
        </Button>
        <Button 
          variant="danger" 
          onClick={handleSaveProfile}
        >
          {t("common.save")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProfileModal;