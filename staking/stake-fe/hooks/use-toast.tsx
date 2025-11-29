'use client';

import * as React from 'react';

// Define types
type ToastData = {
  id: string;
  variant: 'default' | 'success' | 'error' | 'warning';
  title: string;
  description?: string;
};

type ToastProviderState = {
  toasts: ToastData[];
  toast: (data: Omit<ToastData, 'id'>) => void;
};

// 1. Create Context
const ToastContext = React.createContext<ToastProviderState | undefined>(
  undefined
);

// 2. Create a custom hook to use the context
export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastStateProvider');
  }
  return context;
}

// 3. Create the Provider component that will hold the state
export function ToastStateProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const toast = React.useCallback((data: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...data, id }]);

    // Auto-close after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const value = { toasts, toast };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}
