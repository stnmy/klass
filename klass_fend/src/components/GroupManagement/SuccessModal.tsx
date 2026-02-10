import { CheckCircle2 } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuccessModal = ({ isOpen, onClose }: SuccessModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-deep/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-brand-teal/10 text-brand-teal rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={48} strokeWidth={2.5} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-brand-deep uppercase tracking-tight">
            Sync Complete
          </h3>
          <p className="text-xs text-brand-muted font-bold uppercase tracking-wider">
            Roster updated successfully
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-4 bg-brand-teal text-white font-black rounded-2xl hover:bg-brand-deep transition-all uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-brand-teal/20"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
