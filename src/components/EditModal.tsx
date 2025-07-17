import React, { useState, useRef, useEffect } from 'react';
import styles from './EditModal.module.css';

interface EditModalProps {
  originalContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export const EditModal: React.FC<EditModalProps> = ({ originalContent, onSave, onCancel }) => {
  const [content, setContent] = useState<string>(originalContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  }, []);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (content.trim()) {
      onSave(content.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e);
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h3>Edit Message</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className={styles.textarea}
            rows={10}
            placeholder="Edit your message..."
          />
          <div className={styles.actions}>
            <button type="submit" className={styles.saveButton}>
              Save (Ctrl+Enter)
            </button>
            <button type="button" className={styles.cancelButton} onClick={onCancel}>
              Cancel (Esc)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};