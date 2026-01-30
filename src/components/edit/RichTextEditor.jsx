import React, { useState, useEffect, useRef } from "react";
import MDEditor from '@uiw/react-md-editor';
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";

const RichTextEditor = ({ 
  value, 
  onChange, 
  disabled = false,
  height = 400,
  uploadEndpoint = "/api/upload"
}) => {
  const [editorValue, setEditorValue] = useState(value || "");
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setEditorValue(value || "");
  }, [value]);

  const handleChange = (val) => {
    const newValue = val || "";
    setEditorValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Будь ласка, виберіть файл зображення');
      return null;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка завантаження');
      }
      
      const data = await response.json();
      return data.url || data.path || URL.createObjectURL(file); // fallback to blob URL
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Помилка завантаження: ${error.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const insertImageMarkdown = (url, alt = '') => {
    const markdownImage = `![${alt}](${url})`;
    const newValue = editorValue + `\n${markdownImage}\n`;
    setEditorValue(newValue);
    handleChange(newValue);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const uploadedUrl = await handleImageUpload(file);
      if (uploadedUrl) {
        setImageUrl(uploadedUrl);
        setImageAlt(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
      }
    }
  };

  const handleInsertImage = () => {
    if (!imageUrl.trim()) {
      alert('Будь ласка, введіть URL зображення або завантажте файл');
      return;
    }

    insertImageMarkdown(imageUrl, imageAlt);
    setShowImageModal(false);
    setImageUrl("");
    setImageAlt("");
  };

  // Кастомная панель инструментов для MDEditor
  const CustomToolbar = () => {
    return (
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex gap-1">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setShowImageModal(true)}
            disabled={disabled}
          >
            <i className="bi bi-image me-1"></i>
            Додати зображення
          </Button>
        </div>
        
        <div className="text-muted small">
          <i className="bi bi-info-circle me-1"></i>
          Підтримка Markdown
        </div>
      </div>
    );
  };

  return (
    <div className="rich-text-editor">
      <CustomToolbar />
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        style={{ display: 'none' }}
      />
      
      <MDEditor
        value={editorValue}
        onChange={handleChange}
        height={height}
        preview="edit"
        visibleDragbar={false}
        overflow={false}
        textareaProps={{
          disabled: disabled,
          placeholder: "Введіть текст... (підтримка Markdown)"
        }}
        previewOptions={{
          disallowedElements: ['style', 'script']
        }}
      />
      
      <style>{`
        .rich-text-editor .w-md-editor {
          border-radius: 4px;
          border: 1px solid #dee2e6;
        }
        .rich-text-editor .w-md-editor-toolbar {
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
          border-bottom: 1px solid #dee2e6;
        }
        .rich-text-editor .w-md-editor-content {
          border-bottom-left-radius: 4px;
          border-bottom-right-radius: 4px;
        }
        .rich-text-editor .w-md-editor-text {
          min-height: ${height - 60}px;
        }
        .rich-text-editor .w-md-editor-preview {
          padding: 10px;
        }
        .rich-text-editor .wmde-markdown {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        .rich-text-editor img {
          max-width: 100%;
          height: auto;
        }
      `}</style>

      {/* Модальное окно для вставки изображения */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Вставити зображення</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Завантажити зображення</Form.Label>
              <div className="d-flex gap-2 align-items-center">
                <Button 
                  variant="outline-primary"
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploading || disabled}
                >
                  {uploading ? (
                    <>
                      <Spinner size="sm" className="me-2" animation="border" />
                      Завантаження...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-upload me-1"></i>
                      Вибрати файл
                    </>
                  )}
                </Button>
                {imageUrl && !uploading && (
                  <div className="text-success small">
                    <i className="bi bi-check-circle me-1"></i>
                    Файл готовий до вставки
                  </div>
                )}
              </div>
              <Form.Text className="text-muted">
                Підтримуються форматы: JPG, PNG, GIF, SVG (макс. 5MB)
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Або введіть URL зображення</Form.Label>
              <Form.Control
                type="text"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={uploading || disabled}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Альтернативний текст (alt)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Опис зображення для SEO та доступності"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                disabled={uploading || disabled}
              />
              <Form.Text className="text-muted">
                Цей текст відображається, якщо зображення не завантажиться
              </Form.Text>
            </Form.Group>
            
            {imageUrl && (
              <div className="mt-3 p-2 border rounded bg-light">
                <p className="mb-1 small">Попередній перегляд:</p>
                <div className="text-center">
                  <img 
                    src={imageUrl} 
                    alt={imageAlt || "Попередній перегляд"} 
                    style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = 
                        '<div class="text-danger small">Не вдалося завантажити зображення</div>';
                    }}
                  />
                </div>
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowImageModal(false)}
            disabled={uploading}
          >
            Скасувати
          </Button>
          <Button 
            variant="primary" 
            onClick={handleInsertImage}
            disabled={!imageUrl.trim() || uploading || disabled}
          >
            Вставити в текст
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RichTextEditor;