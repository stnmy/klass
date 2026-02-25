import { AlertTriangle, Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  studentName: string;
}

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  studentName,
}: Props) => {
  // Lock scroll when open and handle Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* BACKDROP - Synced with Workspace Design */}
      <div
        className="absolute inset-0 bg-brand-deep/20 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* MODAL CONTAINER */}
      <div className="relative w-full max-w-md bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-white/40 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 p-2 hover:bg-brand-bg rounded-full transition-colors text-brand-muted hover:text-brand-deep"
        >
          <X size={20} />
        </button>

        <div className="p-12 text-center">
          {/* WARNING ICON */}
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2.2rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
            <AlertTriangle size={40} />
          </div>

          {/* TEXT CONTENT */}
          <div className="space-y-4 mb-10">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-deep">
              Confirm Termination
            </h3>
            <p className="text-[10px] font-bold text-brand-muted uppercase leading-relaxed tracking-widest px-4">
              You are about to purge <br />
              <span className="text-red-500 font-black">
                "{studentName}"
              </span>{" "}
              <br />
              from the master database. This action is irreversible.
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="w-full py-5 bg-red-500 text-white font-black rounded-2xl shadow-xl shadow-red-100 hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-50 uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Authorize Deletion"
              )}
            </button>

            <button
              onClick={onClose}
              disabled={loading}
              className="w-full py-4 bg-transparent text-brand-deep/40 font-black rounded-2xl hover:text-brand-deep transition-all uppercase text-[9px] tracking-[0.2em]"
            >
              Cancel Operation
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DeleteConfirmModal;
