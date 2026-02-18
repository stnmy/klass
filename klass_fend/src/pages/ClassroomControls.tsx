import { useEffect, useState, useRef } from "react";
import { Users, ChevronDown, VolumeX, Shield, MicOff, Mic } from "lucide-react";

interface Participant {
  id: string;
  displayName: string;
  muted?: boolean;
}

interface Props {
  participants: Participant[];
  onMuteAll: () => void;
  onForceMute: (participantId: string) => void; // Updated
  onRequestUnmute: (participantId: string) => void; // Updated
  localDisplayName?: string;
}

const ClassroomControls = ({
  participants,
  onMuteAll,
  onForceMute,
  onRequestUnmute,
  localDisplayName,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter out the teacher (local user)
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
      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl transition-all border ${
          isOpen
            ? "bg-white border-brand-teal shadow-lg ring-4 ring-brand-teal/5"
            : "bg-white/70 backdrop-blur-md border-brand-light/20 shadow-sm hover:bg-white"
        }`}
      >
        <div className="p-1.5 bg-brand-teal/10 text-brand-teal rounded-lg">
          <Users size={16} />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-black text-brand-deep uppercase tracking-widest">
            Classroom
          </p>
          <p className="text-[8px] text-brand-teal font-bold uppercase">
            {studentRoster.length}{" "}
            {studentRoster.length === 1 ? "Student" : "Students"}
          </p>
        </div>
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-[340px] bg-white rounded-[1.5rem] shadow-2xl border border-brand-light/10 overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-200">
          {/* HEADER */}
          <div className="p-4 bg-brand-bg/30 border-b border-brand-light/10 flex justify-between items-center">
            <span className="text-[9px] font-black text-brand-deep uppercase">
              Student Roster
            </span>
            <button
              onClick={() => {
                onMuteAll();
                setIsOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
            >
              <VolumeX size={12} />
              <span className="text-[8px] font-black uppercase">Mute All</span>
            </button>
          </div>

          {/* LIST AREA */}
          <div className="max-h-80 overflow-y-auto p-2 custom-scrollbar">
            {studentRoster.length === 0 ? (
              <div className="py-8 text-center opacity-40">
                <Shield size={24} className="mx-auto mb-2" />
                <p className="text-[9px] font-black uppercase tracking-tighter">
                  No students in session
                </p>
              </div>
            ) : (
              studentRoster.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-brand-bg/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {/* AVATAR & MUTE INDICATOR */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black bg-brand-teal/10 text-brand-teal relative">
                      {student.displayName?.charAt(0).toUpperCase() || "S"}
                      {student.muted && (
                        <div className="absolute -top-0.5 -right-0.5 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm" />
                      )}
                    </div>

                    {/* NAME & STATUS */}
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-brand-deep truncate max-w-[100px]">
                        {student.displayName}
                      </span>
                      <div className="flex items-center gap-1">
                        {!student.muted && (
                          <span className="w-1 h-1 bg-brand-teal rounded-full animate-pulse" />
                        )}
                        <span
                          className={`text-[7px] uppercase font-black tracking-wider ${
                            student.muted ? "text-red-500" : "text-brand-teal"
                          }`}
                        >
                          {student.muted ? "Muted" : "Speaking"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* EXPLICIT ACTION BUTTONS */}
                  <div className="flex items-center gap-2">
                    {/* Force Mute Button */}
                    <button
                      title="Force Mute"
                      onClick={() => onForceMute(student.id)}
                      className={`p-2 rounded-lg transition-all border shadow-sm ${
                        student.muted
                          ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                          : "bg-white border-red-100 text-red-500 hover:bg-red-500 hover:text-white active:scale-95"
                      }`}
                      disabled={student.muted}
                    >
                      <MicOff size={14} />
                    </button>

                    {/* Request Unmute Button */}
                    <button
                      title="Invite to Speak"
                      onClick={() => onRequestUnmute(student.id)}
                      className="p-2 rounded-lg transition-all border border-brand-teal/20 bg-white text-brand-teal hover:bg-brand-teal hover:text-white shadow-sm active:scale-95"
                    >
                      <Mic size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomControls;
