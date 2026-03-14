import {
  Lock,
  Unlock,
  Loader2,
  Users,
  PlayCircle,
  Maximize2,
  Columns,
  Minimize2,
} from "lucide-react";
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
  layout,
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

  const getLayoutBtnClass = (btnLayout: string) => {
    const isActive = layout === btnLayout;
    return `flex items-center gap-1.5 px-3 md:px-4 h-full transition-all duration-300 text-[9px] font-black uppercase tracking-tight
      ${
        isActive
          ? "bg-brand-teal text-white shadow-inner"
          : "bg-white text-gray-900 hover:bg-teal-50 hover:text-brand-teal"
      }`;
  };

  const managementBtnClass =
    "h-10 flex items-center gap-2 px-4 rounded-full border border-brand-light/20 bg-white text-brand-deep hover:bg-brand-bg transition-all duration-300 shadow-sm text-[10px] font-black uppercase tracking-tight whitespace-nowrap";

  return (
    <div className="w-full grid grid-cols-12 items-center pointer-events-none px-2 md:px-4 gap-2">
      {/* LEFT SECTION: col-4 for student */}
      <div
        className={`flex items-center ${
          isTeacher ? "col-span-3 justify-start" : "col-span-4 justify-start"
        }`}
      >
        <div className="pointer-events-auto scale-90 md:scale-100 origin-left">
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

      {/* MIDDLE SECTION: Layout Pill (Centered) */}
      <div
        className={`${isTeacher ? "col-span-6" : "col-span-4"} flex justify-center items-center gap-3`}
      >
        {(!isHeaderLockedUI || isTeacher) && (
          <div className="flex items-center gap-2 md:gap-3 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-500">
            {/* SHARED LAYOUT PILL: Text labels enabled for all screens */}
            <div className="flex h-9 md:h-10 border border-brand-light/20 rounded-full overflow-hidden shadow-sm bg-white">
              <button
                onClick={() => setLayout("min-workspace")}
                className={getLayoutBtnClass("min-workspace")}
                title="Maximize Video"
              >
                <Maximize2 size={12} />
                <span>VDO</span>
              </button>
              <button
                onClick={() => setLayout("split")}
                className={`${getLayoutBtnClass("split")} border-x border-brand-light/10`}
                title="Default Split View"
              >
                <Columns size={12} />
                <span>DFLT</span>
              </button>
              <button
                onClick={() => setLayout("min-video")}
                className={getLayoutBtnClass("min-video")}
                title="Minimize Video"
              >
                <span>CLS</span>
                <Minimize2 size={12} />
              </button>
            </div>

            {/* TEACHER-ONLY: LOCK SWITCH & DROPDOWN */}
            {isTeacher && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleToggleLock(
                      !classroomState.isManualLock,
                      classroomState.focusMode || "default",
                    )
                  }
                  disabled={isSyncingLock}
                  className={`h-10 flex items-center gap-2 px-3 md:px-4 rounded-full border transition-all duration-300 shadow-sm ${
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
                  <span className="text-[10px] font-black uppercase tracking-tight hidden sm:inline">
                    {isHeaderLockedUI ? "Locked" : "Open"}
                  </span>
                  <div
                    className={`w-7 h-3.5 rounded-full relative transition-colors ${isHeaderLockedUI ? "bg-red-500" : "bg-gray-200"}`}
                  >
                    <div
                      className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-all ${isHeaderLockedUI ? "left-4" : "left-0.5"}`}
                    />
                  </div>
                </button>

                <ClassroomControls
                  {...jitsi}
                  setClassroomState={setClassroomState}
                  classroomState={classroomState}
                  onSetLayout={setLayout}
                  localDisplayName={roomData.displayName}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT SECTION: Locked Badge (col-4 pushed right for student) */}
      <div
        className={`${isTeacher ? "col-span-3" : "col-span-4"} flex justify-end items-center gap-2`}
      >
        {isTeacher ? (
          <div className="flex items-center gap-2 pointer-events-auto">
            <a
              href="http://localhost:5091/group"
              className={`${managementBtnClass} hidden xl:flex`}
            >
              <Users size={14} /> <span>Group</span>
            </a>
            <a
              href="http://localhost:5091/startClass"
              className={managementBtnClass}
            >
              <PlayCircle size={14} />
              <span className="hidden sm:inline">Manage Class</span>
            </a>
          </div>
        ) : (
          isHeaderLockedUI && (
            <div className="h-9 md:h-10 px-4 md:px-6 bg-red-600 text-white rounded-full border border-red-700 shadow-md flex items-center gap-2 animate-in slide-in-from-right-4 duration-500 pointer-events-auto">
              <Lock size={12} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">
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
