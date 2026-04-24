import { useToast } from "../contexts/ToastContext";

export function Toast() {
  const { message } = useToast();

  return (
    <div className={`wp-toast ${message ? "show" : ""}`} aria-live="polite">
      {message}
    </div>
  );
}
