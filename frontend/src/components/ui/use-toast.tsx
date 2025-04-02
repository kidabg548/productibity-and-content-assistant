import React, { createContext, useContext, useState } from 'react';

interface Toast {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
}

interface ToastContextType {
    toast: (props: Toast) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = (props: Toast) => {
        setToasts((prev) => [...prev, props]);
        setTimeout(() => {
            setToasts((prev) => prev.slice(1));
        }, 3000);
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50">
                {toasts.map((toast, index) => (
                    <div
                        key={index}
                        className={`mb-2 p-4 rounded-lg shadow-lg ${
                            toast.variant === 'destructive'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-800 text-white'
                        }`}
                    >
                        {toast.title && <h3 className="font-semibold">{toast.title}</h3>}
                        {toast.description && <p className="text-sm">{toast.description}</p>}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
} 