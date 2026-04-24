import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface ToastContextValue {
  message: string | null;
  showToast: (message: string) => void;
  clearToast: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      message,
      showToast(nextMessage: string) {
        setMessage(nextMessage);
        window.setTimeout(() => setMessage(null), 2800);
      },
      clearToast() {
        setMessage(null);
      },
    }),
    [message],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
