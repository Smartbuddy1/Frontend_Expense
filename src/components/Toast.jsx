import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

let toastCount = 0;

export const toast = {
  success: (message) => toast.emit({ message, type: 'success' }),
  error: (message) => toast.emit({ message, type: 'error' }),
  info: (message) => toast.emit({ message, type: 'info' }),
  emit: () => {} // Will be bound by ToastContainer
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toast.emit = ({ message, type }) => {
      const id = ++toastCount;
      setToasts((prev) => [...prev, { id, message, type }]);
      
      // Auto dismiss
      setTimeout(() => {
        setToasts((prev) => prev.filter(t => t.id !== id));
      }, 5000);
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter(t => t.id !== id));
  };

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item toast-${t.type}`}>
          <div className="toast-icon">
            {t.type === 'success' && <CheckCircle2 size={20} />}
            {t.type === 'error' && <AlertCircle size={20} />}
            {t.type === 'info' && <Info size={20} />}
          </div>
          <div className="toast-message">{t.message}</div>
          <button className="toast-close" onClick={() => removeToast(t.id)}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
