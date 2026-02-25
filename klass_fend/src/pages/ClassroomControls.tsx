import { useEffect, useState, useRef } from "react";
import {
  Users,
  ChevronDown,
  VolumeX,
  Shield,
  ShieldAlert,
  MicOff,
  Mic,
  Hand,
} from "lucide-react";

interface Participant {
  id: string;
  displayName: string;
  muted?: boolean;
}

interface Props {
  participants: Participant[];
  raisedHands: string[];
  isStrictMode: boolean; // New
  onToggleStrictMode: (val: boolean) => void; // New
  onMuteAll: () => void;
  onForceMute: (participantId: string) => void;
  onRequestUnmute: (participantId: string) => void;
  onClearHighlight: (participantId: string) => void;
  localDisplayName?: string;
}

const ClassroomControls = ({
  participants,
  raisedHands,
  isStrictMode,
  onToggleStrictMode,
  onMuteAll,
  onForceMute,
  onRequestUnmute,
  onClearHighlight,
  localDisplayName,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const studentRoster = participants.filter(
    (p) => p.displayName?.toLowerCase() !== localDisplayName?.toLowerCase(),
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative pointer-events-auto" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl transition-all border ${
          isOpen
            ? "bg-white border-brand-teal shadow-lg ring-4 ring-brand-teal/5"
            : "bg-white/70 backdrop-blur-md border-brand-light/20 shadow-sm hover:bg-white"
        }`}
      >
        <div
          className={`relative p-1.5 rounded-lg transition-colors ${
            isStrictMode
              ? "bg-red-100 text-red-600"
              : raisedHands.length > 0
                ? "bg-amber-100 text-amber-600"
                : "bg-brand-teal/10 text-brand-teal"
          }`}
        >
          {isStrictMode ? <ShieldAlert size={16} /> : <Users size={16} />}
          {raisedHands.length > 0 && !isStrictMode && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          )}
        </div>
        <div className="text-left">
          <p className="text-[10px] font-black text-brand-deep uppercase tracking-widest">
            {isStrictMode ? "Strict Mode" : "Classroom"}
          </p>
          <p className="text-[8px] font-bold uppercase text-gray-500">
            {studentRoster.length} Students Active
          </p>
        </div>
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-85 bg-white rounded-3xl shadow-2xl border border-brand-light/10 overflow-hidden z-60 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 bg-brand-bg/30 border-b border-brand-light/10 flex gap-2 justify-between items-center">
            <button
              onClick={() => onToggleStrictMode(!isStrictMode)}
              className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-[8px] uppercase transition-all shadow-sm active:scale-95 border ${
                isStrictMode
                  ? "bg-red-600 text-white border-red-700"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Shield size={12} />
              {isStrictMode ? "Strict: ON" : "Strict Mode"}
            </button>

            <button
              onClick={() => {
                onMuteAll();
                setIsOpen(false);
              }}
              className="flex flex-1 items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95 border border-red-100"
            >
              <VolumeX size={12} />
              <span className="text-[8px] font-black uppercase">Mute All</span>
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto p-2 custom-scrollbar">
            {studentRoster.length === 0 ? (
              <div className="py-8 text-center opacity-40">
                <Shield size={24} className="mx-auto mb-2" />
                <p className="text-[9px] font-black uppercase">
                  No students in session
                </p>
              </div>
            ) : (
              studentRoster.map((student) => {
                const isHighlighted = raisedHands.includes(student.id);
                return (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between p-2 rounded-xl transition-all group mb-1 border ${
                      isHighlighted
                        ? "bg-amber-50/50 border-amber-200 shadow-sm"
                        : "hover:bg-brand-bg/50 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black relative ${
                          isHighlighted
                            ? "bg-amber-200 text-amber-700"
                            : "bg-brand-teal/10 text-brand-teal"
                        }`}
                      >
                        {student.displayName?.charAt(0).toUpperCase() || "S"}
                        {isHighlighted && (
                          <div className="absolute -top-1 -right-1 text-amber-600 bg-white rounded-full p-0.5 shadow-sm border border-amber-100">
                            <Hand
                              size={10}
                              fill="currentColor"
                              className="animate-bounce-short"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span
                          className={`text-[10px] font-bold truncate ${isHighlighted ? "text-amber-800" : "text-brand-deep"}`}
                        >
                          {student.displayName}
                        </span>
                        <span className="text-[7px] uppercase font-black opacity-40">
                          STUDENT
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        title="Force Mute"
                        onClick={() => onForceMute(student.id)}
                        className="p-2 rounded-lg bg-white border border-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                        <MicOff size={14} />
                      </button>

                      <button
                        title="Invite to Speak"
                        onClick={() => {
                          onRequestUnmute(student.id);
                          onClearHighlight(student.id);
                        }}
                        className={`p-2 rounded-lg transition-all border shadow-sm ${
                          isHighlighted
                            ? "bg-amber-500 text-white border-amber-600 scale-105 hover:bg-amber-600"
                            : "border-brand-teal/20 bg-white text-brand-teal hover:bg-brand-teal hover:text-white"
                        }`}
                      >
                        <Mic size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomControls;
