import type React from 'react';
import { useState, useCallback } from 'react';
import Toast, { type ToastProps } from './Toast';

interface ToastData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContainerProps {
  maxToasts?: number;
}

let toastCounter = 0;
let addToast: ((toast: Omit<ToastData, 'id'>) => void) | null = null;

export const showToast = (toast: Omit<ToastData, 'id'>) => {
  if (addToast) {
    addToast(toast);
  }
};

const ToastContainer: React.FC<ToastContainerProps> = ({ maxToasts = 5 }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const handleAddToast = useCallback((toastData: Omit<ToastData, 'id'>) => {
    const id = `toast-${++toastCounter}`;
    const newToast = { ...toastData, id };

    setToasts(current => {
      const updated = [newToast, ...current];
      return updated.slice(0, maxToasts);
    });
  }, [maxToasts]);

  const handleRemoveToast = useCallback((id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  // Set the global addToast function
  addToast = handleAddToast;

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 w-96 max-w-full">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={handleRemoveToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
