import { MicOff, Mic, Hand, Shield, X } from "lucide-react";
import api from "../../api/axios";

interface Participant {
  id: string;
  displayName: string;
}

interface LiveSessionRosterProps {
  students: Participant[];
  raisedHands: string[];
  onForceMute: (id: string) => void;
  onRequestUnmute: (id: string) => void;
  // This now strictly updates local UI state after the DB call
  onClearHighlight: (id: string) => void;
}

const LiveSessionRoster = ({
  students,
  raisedHands,
  onForceMute,
  onRequestUnmute,
  onClearHighlight,
}: LiveSessionRosterProps) => {
  const handleLowerHandClick = async (id: string, displayName: string) => {
    try {
      // Direct call to your backend to update the DB state
      await api.post("/class/teacher-lower-hand", {
        displayName: displayName,
      });

      // Update the teacher's local state (removing the amber glow/icon)
      onClearHighlight(id);
    } catch (error) {
      console.error("Database sync failed for lowering hand:", error);
      // Still clear locally so the teacher's UI stays responsive
      onClearHighlight(id);
    }
  };

  if (students.length === 0) {
    return (
      <div className="py-8 text-center opacity-40">
        <Shield size={24} className="mx-auto mb-2" />
        <p className="text-[9px] font-black uppercase tracking-widest">
          No students in session
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto p-2 custom-scrollbar">
      {students.map((student) => {
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
              {isHighlighted && (
                <button
                  title="Lower Student Hand"
                  onClick={() =>
                    handleLowerHandClick(student.id, student.displayName)
                  }
                  className="relative p-2 rounded-lg bg-white border border-amber-200 text-amber-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm group/hand"
                >
                  <Hand
                    size={14}
                    className="group-hover/hand:opacity-0 transition-opacity"
                  />
                  <X
                    size={10}
                    strokeWidth={3}
                    className="absolute inset-0 m-auto opacity-0 group-hover/hand:opacity-100 transition-opacity"
                  />
                </button>
              )}

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
                  if (isHighlighted) {
                    handleLowerHandClick(student.id, student.displayName);
                  }
                }}
                className={`p-2 rounded-lg transition-all border shadow-sm ${
                  isHighlighted
                    ? "bg-amber-500 text-white border-amber-600 scale-105"
                    : "border-brand-teal/20 bg-white text-brand-teal hover:bg-brand-teal hover:text-white"
                }`}
              >
                <Mic size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LiveSessionRoster;
