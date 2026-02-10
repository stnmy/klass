import { RefreshCw, XCircle, Activity } from "lucide-react";
import { useState } from "react";

interface Props {
  activeStudents: string[];
  onSync: () => void;
}

export const LiveSessionStatus = ({ activeStudents, onSync }: Props) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    onSync();
    // Animation timeout to give visual feedback
    setTimeout(() => setIsSyncing(false), 600);
  };

  return (
    <section className="bg-brand-deep border border-brand-deep rounded-[2rem] overflow-hidden shadow-2xl shadow-brand-deep/30 flex flex-col h-[580px] transition-all duration-300">
      {/* Header Section - Tightened */}
      <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-brand-deep/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-teal animate-ping absolute inset-0" />
            <div className="w-2.5 h-2.5 rounded-full bg-brand-teal relative" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-white/50 leading-none">
              Live Status
            </span>
            <span className="text-[9px] font-bold text-brand-teal/60 uppercase tracking-tighter mt-1">
              Jitsi Active Room
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="group flex items-center gap-2 text-[9px] text-white/40 hover:text-brand-teal transition-all font-black uppercase tracking-widest disabled:opacity-50"
          >
            <RefreshCw
              size={12}
              className={`${isSyncing ? "animate-spin text-brand-teal" : "group-hover:rotate-180 transition-transform duration-500"}`}
            />{" "}
            Sync
          </button>
          <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <span className="text-xs font-black text-brand-teal">
              {activeStudents.length}{" "}
              <span className="text-white/20 ml-0.5">/ 25</span>
            </span>
          </div>
        </div>
      </div>

      {/* List Section - Adjusted Padding/Spacing */}
      <div className="divide-y divide-white/5 overflow-y-auto flex-grow bg-brand-deep px-3 custom-scrollbar">
        {activeStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-20 text-white space-y-3">
            <div className="p-4 rounded-full border border-white/20">
              <XCircle size={32} strokeWidth={1} />
            </div>
            <p className="font-black text-[9px] uppercase tracking-[0.3em] italic">
              No active participants
            </p>
          </div>
        ) : (
          activeStudents.map((email) => (
            <div
              key={email}
              className="flex items-center px-4 py-3.5 my-1 group hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/5"
            >
              {/* Avatar Icon */}
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-brand-teal font-black text-xs group-hover:bg-brand-teal group-hover:text-white transition-all">
                {email.charAt(0).toUpperCase()}
              </div>

              {/* Email/Info */}
              <div className="ml-4 flex-grow overflow-hidden">
                <p className="text-xs font-bold text-white tracking-tight truncate">
                  {email}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Activity
                    size={10}
                    className="text-brand-teal animate-pulse"
                  />
                  <span className="text-[9px] text-brand-teal/70 uppercase font-black tracking-widest">
                    In Session
                  </span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="w-1.5 h-1.5 rounded-full bg-brand-teal/40 group-hover:bg-brand-teal transition-colors" />
            </div>
          ))
        )}
      </div>

      {/* Footer Info (Optional - helps fill space and look pro) */}
      {activeStudents.length > 0 && (
        <div className="px-6 py-3 bg-white/[0.02] border-t border-white/5">
          <p className="text-[8px] uppercase font-black text-white/20 tracking-widest text-center">
            Real-time data synced from video bridge
          </p>
        </div>
      )}
    </section>
  );
};
