import  { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const recentToasts = useRef(new Set());

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    const toastKey = `${message}-${type}`;
    
    if (recentToasts.current.has(toastKey)) {
      return null; 
    }
    recentToasts.current.add(toastKey);
  
    setTimeout(() => {
      recentToasts.current.delete(toastKey);
    }, 500);
   
    const existingToast = toasts.find(toast => 
      toast.message === message && toast.type === type
    );
    
    if (existingToast) {
      return existingToast.id; 
    }

    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type, 
      duration
    };

    setToasts(prev => [...prev, toast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  }, [removeToast, toasts]); 

  const showSuccess = useCallback((message, duration) => {
    return showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message, duration) => {
    return showToast(message, 'error', duration);
  }, [showToast]);

  const showInfo = useCallback((message, duration) => {
    return showToast(message, 'info', duration);
  }, [showToast]);

  const showWarning = useCallback((message, duration) => {
    return showToast(message, 'warning', duration);
  }, [showToast]);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
    recentToasts.current.clear();
  }, []);

  const value = {
    toasts,
    showToast,
    removeToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    clearAllToasts
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};