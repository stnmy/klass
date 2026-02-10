import { AlertTriangle, Loader2, X } from "lucide-react";

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-brand-deep/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} />
          </div>

          <h3 className="text-xl font-black text-brand-deep uppercase tracking-tighter mb-2">
            Delete Student?
          </h3>
          <p className="text-sm text-brand-muted font-medium px-4">
            You are about to remove{" "}
            <span className="font-bold text-brand-deep">"{studentName}"</span>.
            This will permanently delete their account and data.
          </p>
        </div>

        <div className="px-8 pb-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-brand-bg text-brand-muted font-black rounded-2xl hover:bg-brand-light/20 transition-all uppercase text-[10px] tracking-widest"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-4 bg-red-500 text-white font-black rounded-2xl shadow-lg shadow-red-200 hover:bg-red-600 transition-all disabled:opacity-50 uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              "Delete Forever"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
