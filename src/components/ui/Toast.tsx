import { CheckCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  onClose: () => void;
}

function Toast({
  message,
  onClose,
}: ToastProps) {
  return (
    <div className="fixed right-4 top-5 z-[9999] flex w-[calc(100%-2rem)] max-w-sm items-center gap-3 rounded-2xl border border-green-200 bg-white px-4 py-3 shadow-2xl sm:right-6 sm:top-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
        <CheckCircle
          size={22}
          className="text-green-600"
        />
      </div>

      <p className="flex-1 text-sm font-semibold text-[#29221b]">
        {message}
      </p>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
      >
        <X size={17} />
      </button>
    </div>
  );
}

export default Toast;