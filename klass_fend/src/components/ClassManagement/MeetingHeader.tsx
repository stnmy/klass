import { Lock, Unlock, Loader2 } from "lucide-react";
import QuickControls from "./QuickControls";
import ClassroomControls from "../../pages/ClassroomControls";

const MeetingHeader = ({
  isTeacher,
  classroomState,
  setClassroomState,
  isSyncingLock,
  handleToggleLock,
  jitsi,
  roomData,
  setLayout,
}: any) => {
  const isHeaderLockedUI =
    !isSyncingLock && classroomState.isManualLock === true;

  return (
    <div className="absolute top-12 left-12 right-12 z-30 grid grid-cols-12 items-center pointer-events-none">
      {/* CENTER / FULL: Quick Controls */}
      <div
        className={`transition-all duration-500 flex ${
          isTeacher
            ? "col-span-8 justify-start" // Teacher: Aligned left/center within 8 cols
            : "col-span-12 justify-center" // Student: Full width and centered
        }`}
      >
        <div className="pointer-events-auto">
          <QuickControls
            {...jitsi}
            showScreenShare={isTeacher}
            onToggleAudio={() => jitsi.execute("toggleAudio")}
            onToggleVideo={() => jitsi.execute("toggleVideo")}
            onToggleHand={() => jitsi.execute("toggleRaiseHand")}
            onToggleShare={() => jitsi.execute("toggleShareScreen")}
            onHangUp={() => jitsi.execute("hangup")}
          />
        </div>
      </div>

      {/* RIGHT: Classroom Actions */}
      {/* We only show this col if it's a teacher OR if a student needs to see the Locked status */}
      {(isTeacher || classroomState.isLocked) && (
        <div className="col-span-4 flex justify-end items-center gap-3 pointer-events-auto">
          {isTeacher ? (
            <>
              <button
                onClick={() => {
                  const nextManualState = !classroomState.isManualLock;
                  handleToggleLock(
                    nextManualState,
                    classroomState.focusMode || "default",
                  );
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

                <span className="text-[10px] font-black uppercase tracking-tight whitespace-nowrap">
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
                onRequestUnmute={(id: string) =>
                  jitsi.execute("askToUnmute", id)
                }
                localDisplayName={roomData.displayName}
              />
            </>
          ) : (
            // Student Locked Badge
            <div className="h-10 bg-gray-100 text-gray-500 px-4 rounded-full border border-gray-200 flex items-center gap-2">
              <Lock size={14} />
              <span className="text-[10px] font-black uppercase tracking-tight">
                Locked
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MeetingHeader;
