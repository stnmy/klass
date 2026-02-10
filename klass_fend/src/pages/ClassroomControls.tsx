import { useState, useRef, useEffect } from "react";
import { Users, ChevronDown, VolumeX, Shield } from "lucide-react";

interface Participant {
  id: string;
  displayName: string;
}

interface Props {
  participants: Participant[];
  onMuteAll: () => void;
  localDisplayName?: string;
}

const ClassroomControls = ({
  participants,
  onMuteAll,
  localDisplayName,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter out the teacher from the roster display
  const studentRoster = participants.filter(
    (p) => p.displayName?.toLowerCase() !== localDisplayName?.toLowerCase(),
  );

  // Close dropdown when clicking outside
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
      {/* Main Trigger Button */}
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
            {studentRoster.length} Students
          </p>
        </div>
        <ChevronDown
          size={14}
          className={`text-brand-muted transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-72 bg-white rounded-[1.5rem] shadow-2xl border border-brand-light/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[60]">
          {/* Header */}
          <div className="p-4 bg-brand-bg/30 border-b border-brand-light/10 flex justify-between items-center">
            <span className="text-[9px] font-black text-brand-deep uppercase tracking-tighter">
              Student Roster
            </span>
            <button
              onClick={() => {
                onMuteAll();
                setIsOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all group"
            >
              <VolumeX size={12} />
              <span className="text-[8px] font-black uppercase">Mute All</span>
            </button>
          </div>

          {/* List Area */}
          <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
            {studentRoster.length === 0 ? (
              <div className="py-8 text-center opacity-40">
                <Shield size={24} className="mx-auto mb-2" strokeWidth={1} />
                <p className="text-[9px] font-black uppercase">
                  No students joined
                </p>
              </div>
            ) : (
              studentRoster.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-brand-bg transition-colors group"
                >
                  {/* Student Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black bg-brand-teal/10 text-brand-teal">
                      {student.displayName?.charAt(0) || "S"}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-brand-deep truncate max-w-[180px]">
                        {student.displayName || "Student"}
                      </span>
                      <span className="text-[7px] uppercase font-black tracking-tighter text-brand-teal">
                        In Session
                      </span>
                    </div>
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
