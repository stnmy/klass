import { Lock, Unlock, Loader2, Users, PlayCircle } from "lucide-react";
import QuickControls from "./QuickControls";
import ClassroomControls from "../../pages/ClassroomControls";
import backendApi from "../../api/axios";

const MeetingHeader = ({
  isTeacher,
  classroomState,
  setClassroomState,
  isSyncingLock,
  handleToggleLock,
  jitsi,
  roomData,
  setLayout,
  isHandRaised,
  setIsHandRaised,
}: any) => {
  const isHeaderLockedUI =
    !isSyncingLock && classroomState?.isManualLock === true;

  const handleHandToggle = async (newState: boolean) => {
    if (setIsHandRaised) setIsHandRaised(newState);
    jitsi.execute("toggleRaiseHand");
    try {
      await backendApi.post("/class/update-hand-state", { isRaised: newState });
    } catch (err) {
      console.error("Failed to update database:", err);
      if (setIsHandRaised) setIsHandRaised(!newState);
    }
  };

  const managementBtnClass =
    "h-10 flex items-center gap-2 px-4 rounded-full border border-brand-light/20 bg-white text-brand-deep hover:bg-brand-bg transition-all duration-300 shadow-sm text-[10px] font-black uppercase tracking-tight whitespace-nowrap";

  return (
    <div className="w-full grid grid-cols-12 items-center pointer-events-none px-4">
      {/* LEFT: Quick Controls (Centered for students, Left-aligned for teachers) */}
      <div
        className={`flex items-center ${
          isTeacher ? "col-span-3 justify-start" : "col-span-11 justify-center"
        }`}
      >
        <div className="pointer-events-auto">
          <QuickControls
            {...jitsi}
            isHandRaised={isHandRaised}
            showScreenShare={isTeacher}
            onToggleAudio={() => jitsi.execute("toggleAudio")}
            onToggleVideo={() => jitsi.execute("toggleVideo")}
            onToggleHand={handleHandToggle}
            onToggleShare={() => jitsi.execute("toggleShareScreen")}
            onHangUp={() => jitsi.execute("hangup")}
          />
        </div>
      </div>

      {/* MIDDLE: Teacher Management Switch (Only visible for teachers) */}
      {isTeacher && (
        <div className="col-span-6 flex justify-center items-center gap-3">
          <div className="flex items-center gap-3 pointer-events-auto">
            <button
              onClick={() => {
                const willBeLocked = !classroomState.isManualLock;
                if (!willBeLocked) {
                  handleToggleLock(false, "default", false);
                } else {
                  handleToggleLock(true, classroomState.focusMode || "default");
                }
              }}
              disabled={isSyncingLock}
              className={`group h-10 flex items-center gap-2 px-4 rounded-full border transition-all duration-300 shadow-sm ${
                isHeaderLockedUI
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-white border-brand-light/20 text-brand-deep hover:bg-brand-bg"
              } ${isSyncingLock ? "opacity-80 cursor-not-allowed" : ""}`}
            >
              {isSyncingLock ? (
                <Loader2 size={14} className="animate-spin" />
              ) : isHeaderLockedUI ? (
                <Lock size={14} />
              ) : (
                <Unlock size={14} />
              )}
              <span className="text-[10px] font-black uppercase tracking-tight">
                {isSyncingLock
                  ? "Syncing..."
                  : isHeaderLockedUI
                    ? "UI Locked"
                    : "UI Open"}
              </span>
              <div
                className={`ml-1 w-8 h-4 rounded-full relative transition-colors ${
                  isHeaderLockedUI ? "bg-red-500" : "bg-gray-200"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
                    isHeaderLockedUI ? "left-4" : "left-0.5"
                  }`}
                />
              </div>
            </button>

            <ClassroomControls
              participants={jitsi.participants}
              raisedHands={jitsi.raisedHands}
              isStrictMode={jitsi.isStrictMode}
              onToggleStrictMode={jitsi.toggleStrictMode}
              setClassroomState={setClassroomState}
              classroomState={classroomState}
              onSetLayout={setLayout}
              onClearHighlight={(id: string) =>
                jitsi.setRaisedHands((prev: any[]) =>
                  prev.filter((hid: string) => hid !== id),
                )
              }
              onMuteAll={() => jitsi.execute("muteEveryone", "audio")}
              onForceMute={(id: string) => {
                jitsi.execute("muteRemoteParticipant", id, "audio");
                jitsi.execute("rejectModeration", id, "audio");
              }}
              onRequestUnmute={(id: string) => jitsi.execute("askToUnmute", id)}
              localDisplayName={roomData.displayName}
            />
          </div>
        </div>
      )}

      {/* RIGHT: Management Links (Teacher) or Locked Label (Student) */}
      <div
        className={`${isTeacher ? "col-span-3" : "col-span-1"} flex justify-end items-center gap-2`}
      >
        {isTeacher ? (
          <div className="flex items-center gap-2 pointer-events-auto">
            <a
              href="http://localhost:5091/group"
              className={managementBtnClass}
            >
              <Users size={14} />
              <span>Manage Group</span>
            </a>
            <a
              href="http://localhost:5091/startClass"
              className={managementBtnClass}
            >
              <PlayCircle size={14} />
              <span>Manage Class</span>
            </a>
          </div>
        ) : (
          classroomState?.isLocked && (
            <div className="h-10 w-10 lg:w-auto bg-red-600 text-white px-3 lg:px-4 rounded-full border border-red-700 shadow-md flex items-center justify-center lg:gap-2 animate-in fade-in zoom-in duration-300">
              <Lock size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-tight hidden lg:inline">
                Locked
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MeetingHeader;
