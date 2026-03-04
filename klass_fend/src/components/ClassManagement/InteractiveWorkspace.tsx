import React from "react";
import { Monitor, Lock, Unlock, Loader2 } from "lucide-react";
import QuickControls from "./QuickControls";
import ClassroomControls from "../../pages/ClassroomControls";

interface InteractiveWorkspaceProps {
  isTeacher: boolean;
  classroomState: { isLocked: boolean; focusMode: string };
  isSyncingLock: boolean;
  handleToggleLock: () => void;
  // Jitsi / Control Props
  controls: {
    isAudioMuted: boolean;
    isVideoMuted: boolean;
    isHandRaised: boolean;
    isSharing: boolean;
    isStrictMode: boolean;
    execute: (command: string, ...args: any[]) => void;
    toggleStrictMode: (val: boolean) => void;
  };
  // Participant Props
  participants: any[];
  raisedHands: string[];
  setRaisedHands: React.Dispatch<React.SetStateAction<string[]>>;
  roomData: any;
}

const InteractiveWorkspace: React.FC<InteractiveWorkspaceProps> = ({
  isTeacher,
  classroomState,
  isSyncingLock,
  handleToggleLock,
  controls,
  participants,
  raisedHands,
  setRaisedHands,
  roomData,
}) => {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* --- HEADER GRID (col-12) --- */}
      <div className="relative z-30 grid grid-cols-12 items-center mb-6 w-full gap-4">
        {/* COL 1-2: Live Badge */}
        <div className="col-span-2 flex justify-start">
          <div className="bg-white/80 backdrop-blur-md border border-brand-light/20 px-4 py-2 rounded-full shadow-sm flex items-center gap-3 pointer-events-auto">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" />
            <span className="text-[10px] font-black text-brand-deep uppercase tracking-widest">
              Live Session
            </span>
          </div>
        </div>

        {/* COL 3-8: QuickControls (Shifted down slightly with mt-2) */}
        <div className="col-span-6 flex justify-center mt-2">
          <div className="pointer-events-auto">
            <QuickControls
              isAudioMuted={controls.isAudioMuted}
              isVideoMuted={controls.isVideoMuted}
              isHandRaised={controls.isHandRaised}
              isSharing={controls.isSharing}
              showScreenShare={isTeacher}
              isStrictMode={controls.isStrictMode}
              onToggleAudio={() => controls.execute("toggleAudio")}
              onToggleVideo={() => controls.execute("toggleVideo")}
              onToggleHand={() => controls.execute("toggleRaiseHand")}
              onToggleShare={() => controls.execute("toggleShareScreen")}
            />
          </div>
        </div>

        {/* COL 9-10: UI Lock */}
        <div className="col-span-2 flex justify-end">
          {isTeacher ? (
            <button
              onClick={handleToggleLock}
              disabled={isSyncingLock}
              className={`group flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 shadow-sm pointer-events-auto ${
                classroomState.isLocked
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-white border-brand-light/20 text-brand-deep hover:bg-brand-bg"
              }`}
            >
              {isSyncingLock ? (
                <Loader2 size={14} className="animate-spin" />
              ) : classroomState.isLocked ? (
                <Lock size={14} />
              ) : (
                <Unlock
                  size={14}
                  className="text-gray-400 group-hover:text-brand-deep"
                />
              )}
              <span className="text-[10px] font-black uppercase tracking-tight">
                {classroomState.isLocked ? "UI Locked" : "UI Open"}
              </span>
              <div
                className={`ml-1 w-8 h-4 rounded-full relative transition-colors duration-300 ${classroomState.isLocked ? "bg-red-500" : "bg-gray-200"}`}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${classroomState.isLocked ? "left-4.5" : "left-0.5"}`}
                />
              </div>
            </button>
          ) : (
            classroomState.isLocked && (
              <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-full border border-gray-200 flex items-center gap-2">
                <Lock size={14} />
                <span className="text-[10px] font-black uppercase tracking-tight">
                  Locked
                </span>
              </div>
            )
          )}
        </div>

        {/* COL 11-12: Classroom Controls */}
        <div className="col-span-2 flex justify-end pointer-events-auto">
          {isTeacher && (
            <ClassroomControls
              participants={participants}
              raisedHands={raisedHands}
              isStrictMode={controls.isStrictMode}
              onToggleStrictMode={controls.toggleStrictMode}
              onClearHighlight={(id) =>
                setRaisedHands((prev) => prev.filter((hid) => hid !== id))
              }
              onMuteAll={() => controls.execute("muteEveryone", "audio")}
              onForceMute={(id) => {
                controls.execute("muteRemoteParticipant", id, "audio");
                controls.execute("rejectModeration", id, "audio");
              }}
              onRequestUnmute={(id) => controls.execute("askToUnmute", id)}
              localDisplayName={roomData.displayName}
            />
          )}
        </div>
      </div>

      {/* --- ACTUAL WORKSPACE CANVAS --- */}
      <div className="flex-1 bg-white rounded-apple border border-brand-light/20 shadow-sm relative overflow-hidden">
        <div className="h-full w-full flex flex-col items-center justify-center opacity-20 select-none">
          <Monitor
            size={64}
            strokeWidth={1}
            className="text-brand-deep mb-4 mx-auto"
          />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-deep">
            Interactive Workspace
          </p>
        </div>
      </div>
    </div>
  );
};

export default InteractiveWorkspace;
