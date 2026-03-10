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
    !isSyncingLock && classroomState?.isManualLock === true;

  return (
    /* REMOVED: absolute, top-12, left-12, right-12.
       ADDED: w-full. 
       The parent <header> in MeetingPage now handles the padding and height.
    */
    <div className="w-full grid grid-cols-12 items-center pointer-events-none">
      {/* LEFT/CENTER: Quick Controls */}
      <div
        className={`transition-all duration-500 flex ${
          isTeacher
            ? "col-span-8 justify-start" // Teacher: Aligned left
            : "col-span-11 justify-center" // Student: Centered
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
      {(isTeacher || classroomState?.isLocked) && (
        <div
          className={`flex justify-end items-center gap-3 pointer-events-auto ${
            isTeacher ? "col-span-4" : "col-span-1"
          }`}
        >
          {isTeacher ? (
            <>
              {/* Lock UI Toggle */}
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

                {/* Toggle Switch Visual */}
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

              {/* Advanced Teacher Controls */}
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
            /* Student Locked Badge */
            <div className="h-10 bg-red-600 text-white px-4 rounded-full border border-red-700 shadow-md flex items-center gap-2 transition-all animate-in fade-in zoom-in duration-300">
              <Lock size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-tight whitespace-nowrap hidden lg:inline">
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
