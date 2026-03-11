import { useEffect, useState, useRef } from "react";
import {
  Users,
  ChevronDown,
  VolumeX,
  Shield,
  ShieldAlert,
  Video,
  Layout,
  Monitor,
  RotateCcw,
  Loader2,
} from "lucide-react";
import api from "../api/axios";
import LiveSessionRoster from "../components/ClassManagement/LiveSessionRoaster";

interface Participant {
  id: string;
  displayName: string;
  muted?: boolean;
}

interface Props {
  participants: Participant[];
  raisedHands: string[];
  isStrictMode: boolean;
  onToggleStrictMode: (val: boolean) => void;
  onMuteAll: () => void;
  onForceMute: (participantId: string) => void;
  onRequestUnmute: (participantId: string) => void;
  onClearHighlight: (participantId: string) => void;
  localDisplayName?: string;
  setClassroomState: React.Dispatch<React.SetStateAction<any>>;
  classroomState: any;
  onSetLayout: (layout: string) => void;
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
  setClassroomState,
  classroomState,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [syncingMode, setSyncingMode] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const studentRoster = participants.filter(
    (p) => p.displayName?.toLowerCase() !== localDisplayName?.toLowerCase(),
  );

  /**
   * Syncs the classroom-wide layout (broadcast).
   * Note: This NO LONGER calls onSetLayout. It only affects the students.
   */
  const syncLayout = async (mode: string, locked: boolean, synced: boolean) => {
    try {
      setSyncingMode(mode === "default" && !locked ? "reset" : mode);
      const payload = {
        focusMode: mode,
        isLocked: locked,
        isSynced: synced,
        isManualLock: classroomState.isManualLock,
      };

      await api.post("/class/sync-layout", payload);

      // Update the global state so buttons highlight correctly
      setClassroomState((prev: any) => ({
        ...prev,
        focusMode: mode,
        isLocked: locked,
        isSynced: synced,
      }));

      // TEACHER VIEW: Is now left untouched.
      // Teacher stays in whatever view they manually selected.
    } catch (err) {
      console.error("Layout synchronization failed", err);
    } finally {
      setSyncingMode(null);
    }
  };

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

  /**
   * Logic: Strictly Global Focus Mode.
   * Buttons highlight ONLY if the classroom is set to that mode.
   */
  const getActiveState = (mode: string, lockedReq: boolean) => {
    return (
      classroomState.focusMode === mode && classroomState.isLocked === lockedReq
    );
  };

  return (
    <div className="relative pointer-events-auto" ref={dropdownRef}>
      {/* Dropdown Trigger */}
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

      {/* Main Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-85 bg-white rounded-3xl shadow-2xl border border-brand-light/10 overflow-hidden z-60 animate-in fade-in zoom-in-95 duration-200">
          {/* 1. Global Sync Grid: Strictly reflects classroomState */}
          <div className="p-3 bg-gray-50/50 border-b border-brand-light/10 grid grid-cols-4 gap-2">
            <LayoutBtn
              icon={<Video size={14} />}
              label="Jitsi"
              isActive={getActiveState("jitsi", true)}
              isLoading={syncingMode === "jitsi"}
              onClick={() => syncLayout("jitsi", true, false)}
            />
            <LayoutBtn
              icon={<Layout size={14} />}
              label="Default"
              isActive={getActiveState("default", true)}
              isLoading={syncingMode === "default"}
              onClick={() => syncLayout("default", true, false)}
            />
            <LayoutBtn
              icon={<Monitor size={14} />}
              label="Class"
              isActive={getActiveState("class", true)}
              isLoading={syncingMode === "class"}
              onClick={() => syncLayout("class", true, false)}
            />
            <LayoutBtn
              icon={<RotateCcw size={14} />}
              label="Reset"
              isActive={getActiveState("default", false)}
              isLoading={syncingMode === "reset"}
              onClick={() => syncLayout("default", false, false)}
              isReset
            />
          </div>

          {/* 2. Global Moderation Bar */}
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

          {/* 3. Live Session Roster Component */}
          <LiveSessionRoster
            students={studentRoster}
            raisedHands={raisedHands}
            onForceMute={onForceMute}
            onRequestUnmute={onRequestUnmute}
            onClearHighlight={onClearHighlight}
          />
        </div>
      )}
    </div>
  );
};

const LayoutBtn = ({
  icon,
  label,
  onClick,
  isActive,
  isLoading,
  isReset = false,
}: any) => {
  const activeClass = isReset
    ? "bg-red-600 text-white border-red-700"
    : "bg-brand-teal text-white border-brand-teal shadow-md";

  const inactiveClass = isReset
    ? "bg-red-50 border-red-100 text-red-600 hover:bg-red-100"
    : "bg-white border-gray-100 hover:border-brand-teal text-brand-deep group";

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all border active:scale-95 disabled:opacity-70 ${
        isActive ? activeClass : inactiveClass
      }`}
    >
      {isLoading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <div
          className={!isReset && !isActive ? "group-hover:text-brand-teal" : ""}
        >
          {icon}
        </div>
      )}
      <span className="text-[7px] font-black uppercase">{label}</span>

      {isActive && !isReset && (
        <div className="absolute bottom-1 w-1 h-1 bg-white rounded-full animate-pulse" />
      )}
    </button>
  );
};

export default ClassroomControls;
