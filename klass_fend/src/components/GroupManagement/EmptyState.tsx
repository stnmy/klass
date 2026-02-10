import { Users } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="w-full py-24 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-brand-light/20 flex flex-col items-center justify-center space-y-4 transition-all">
      <div className="p-6 bg-brand-bg rounded-full text-brand-muted/30">
        <Users size={40} strokeWidth={1} />
      </div>
      <div className="max-w-xs space-y-2">
        <p className="text-brand-deep font-black uppercase text-[11px] tracking-[0.2em]">
          No Target Selected
        </p>
        <p className="text-brand-muted font-bold uppercase text-[9px] tracking-widest leading-relaxed">
          Please choose a group from the selector above to manage student
          assignments.
        </p>
      </div>
    </div>
  );
};

export default EmptyState;
