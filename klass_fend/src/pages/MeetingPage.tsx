import { useEffect, useState, useCallback, useRef } from "react";
import { Monitor, Mic, MicOff, X, Lock, Unlock, Loader2 } from "lucide-react";
import api from "../api/axios";
import { useUser } from "../context/userContext";
import { useJitsi } from "../components/ClassManagement/useJitsi";
import { useClassroomSignalR } from "../components/useClassroomSignalR";
import ClassroomControls from "./ClassroomControls";
import QuickControls from "../components/ClassManagement/QuickControls";
import ClassroomSidebar from "../components/ClassManagement/ClassroomSidebar";
import LoadingScreen from "../components/ClassManagement/LoadingScreen";

const MeetingPage = () => {
  const { user } = useUser();
  const [layout, setLayout] = useState<"split" | "min-video" | "min-workspace">(
    "split",
  );
  const [roomData, setRoomData] = useState<any>(null);
  const [jwt, setJwt] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSyncingLock, setIsSyncingLock] = useState(false);

  // Ref to prevent API calls on the very first mount/initial load
  const isInitialMount = useRef(true);

  const [classroomState, setClassroomState] = useState({
    focusMode: "default",
    isLocked: false,
  });

  const isTeacher = user?.role?.toLowerCase() === "teacher";

  const {
    onApiReady,
    participants,
    isAudioMuted,
    isVideoMuted,
    isHandRaised,
    isSharing,
    activeNotification,
    setActiveNotification,
    execute,
    raisedHands,
    setRaisedHands,
    isStrictMode,
    toggleStrictMode,
  } = useJitsi(isTeacher);

  // Helper to translate backend strings to layout types
  const applyFocusMode = useCallback((mode: string) => {
    const m = mode.toLowerCase();
    if (m === "jitsi") setLayout("min-workspace");
    else if (m === "class") setLayout("min-video");
    else setLayout("split");
  }, []);

  useClassroomSignalR(
    useCallback(
      (mode: string) => {
        if (!isTeacher) {
          applyFocusMode(mode);
        }
        setClassroomState((prev) => ({ ...prev, focusMode: mode }));
      },
      [isTeacher, applyFocusMode],
    ),

    useCallback(
      (isLocked: boolean, focusMode: string) => {
        setClassroomState({ isLocked, focusMode });
        if (!isTeacher && isLocked) {
          applyFocusMode(focusMode);
        }
      },
      [isTeacher, applyFocusMode],
    ),
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isTeacher && classroomState.isLocked) {
      const syncFocus = async () => {
        let mode = "default";
        if (layout === "min-workspace") mode = "jitsi";
        if (layout === "min-video") mode = "class";

        try {
          await api.post("/class/focus", JSON.stringify(mode), {
            headers: { "Content-Type": "application/json" },
          });
          setClassroomState((prev) => ({ ...prev, focusMode: mode }));
        } catch (err) {
          console.error("Failed to sync focus mode", err);
        }
      };
      syncFocus();
    }
  }, [layout, classroomState.isLocked, isTeacher]);

  const handleToggleLock = async () => {
    const newLockStatus = !classroomState.isLocked;
    setIsSyncingLock(true);
    try {
      const response = await api.post("/class/lock", newLockStatus, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        setClassroomState((prev) => ({ ...prev, isLocked: newLockStatus }));

        if (newLockStatus) {
          let mode = "default";
          if (layout === "min-workspace") mode = "jitsi";
          if (layout === "min-video") mode = "class";
          await api.post("/class/focus", JSON.stringify(mode), {
            headers: { "Content-Type": "application/json" },
          });
        }
      }
    } catch (err) {
      console.error("Failed to update lock status", err);
    } finally {
      setIsSyncingLock(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [accessRes, stateRes] = await Promise.all([
          api.get("/user/GetClassroomAccess"),
          api.get("/class/state"),
        ]);

        if (accessRes.status === 200) {
          setJwt(accessRes.data.token);
          setRoomData(accessRes.data);
        }

        if (stateRes.status === 200) {
          const data = stateRes.data;
          setClassroomState(data);
          if (data.isLocked && !isTeacher) {
            applyFocusMode(data.focusMode);
          }
        }
      } catch (err) {
        console.error("Initialization Error", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [applyFocusMode, isTeacher]);

  if (loading) return <LoadingScreen />;
  if (!roomData)
    return (
      <div className="h-screen flex items-center justify-center bg-brand-bg text-brand-deep font-black uppercase tracking-widest">
        Access Denied
      </div>
    );

  return (
    <div className="relative flex h-screen w-full bg-[#F8F9FA] pt-8 overflow-hidden">
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-10000 flex flex-col gap-3 items-center w-full max-w-md px-4 pointer-events-none">
        {activeNotification?.visible && (
          <div
            className={`flex items-center gap-4 p-4 rounded-4xl shadow-2xl border-2 animate-in slide-in-from-top-4 duration-300 w-full bg-white pointer-events-auto ${activeNotification.type === "unmute-request" ? "border-brand-teal" : "border-red-400"}`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${activeNotification.type === "unmute-request" ? "bg-brand-teal/10 text-brand-teal" : "bg-red-50/80 text-red-500"}`}
            >
              {activeNotification.type === "unmute-request" ? (
                <Mic size={20} className="animate-pulse" />
              ) : (
                <MicOff size={20} />
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] font-black uppercase tracking-tighter text-brand-deep">
                {activeNotification.type === "unmute-request"
                  ? "Permission Granted"
                  : "Audio Update"}
              </h4>
              <p className="text-[11px] text-gray-500 font-medium leading-tight">
                {activeNotification.type === "unmute-request"
                  ? "You can now unmute your microphone."
                  : "Moderator has locked your audio."}
              </p>
            </div>
            <button
              onClick={() => setActiveNotification(null)}
              className="text-gray-300 hover:text-gray-500 transition-colors p-1"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <main
        className={`relative flex flex-col transition-all duration-700 ease-in-out border-r border-brand-light/10 ${layout === "min-workspace" ? "w-17.5 p-0 overflow-hidden" : "flex-1 p-6 lg:p-8"}`}
      >
        <div
          className={`flex-1 flex flex-col transition-opacity duration-300 ${layout === "min-workspace" ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <div className="absolute top-12 left-12 right-12 z-30 grid grid-cols-12 items-center pointer-events-none">
            {/* LEFT: Live Status (Cols 1-3) */}
            <div className="col-span-3 flex justify-start">
              {/* Added 'h-10' and 'flex items-center' for height normalization */}
              <div className="h-10 bg-white/80 backdrop-blur-md border border-brand-light/20 px-4 rounded-full shadow-sm pointer-events-auto flex items-center gap-3">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" />
                <span className="text-[10px] font-black text-brand-deep uppercase tracking-widest whitespace-nowrap">
                  Live Session
                </span>
              </div>
            </div>

            {/* CENTER: Quick Controls (Cols 4-9) */}
            <div className="col-span-6 flex justify-center">
              <div className="pointer-events-auto">
                <QuickControls
                  isAudioMuted={isAudioMuted}
                  isVideoMuted={isVideoMuted}
                  isHandRaised={isHandRaised}
                  isSharing={isSharing}
                  showScreenShare={isTeacher}
                  isStrictMode={isStrictMode}
                  onToggleAudio={() => execute("toggleAudio")}
                  onToggleVideo={() => execute("toggleVideo")}
                  onToggleHand={() => execute("toggleRaiseHand")}
                  onToggleShare={() => execute("toggleShareScreen")}
                />
              </div>
            </div>

            {/* RIGHT: Classroom Actions (Cols 10-12) */}
            <div className="col-span-3 flex justify-end items-center gap-3 pointer-events-auto">
              {isTeacher ? (
                <>
                  {/* Added 'h-10' to match the Left badge */}
                  <button
                    onClick={handleToggleLock}
                    disabled={isSyncingLock}
                    className={`group h-10 flex items-center gap-2 px-4 rounded-full border transition-all duration-300 shadow-sm ${
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
                    <span className="text-[10px] font-black uppercase tracking-tight whitespace-nowrap">
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

                  {/* Ensure ClassroomControls internal trigger also uses h-10 */}
                  <ClassroomControls
                    participants={participants}
                    raisedHands={raisedHands}
                    isStrictMode={isStrictMode}
                    onToggleStrictMode={(val) => toggleStrictMode(val)}
                    onClearHighlight={(id) =>
                      setRaisedHands((prev) => prev.filter((hid) => hid !== id))
                    }
                    onMuteAll={() => execute("muteEveryone", "audio")}
                    onForceMute={(id) => {
                      execute("muteRemoteParticipant", id, "audio");
                      execute("rejectModeration", id, "audio");
                    }}
                    onRequestUnmute={(id) => execute("askToUnmute", id)}
                    localDisplayName={roomData.displayName}
                  />
                </>
              ) : (
                classroomState.isLocked && (
                  <div className="h-10 bg-gray-100 text-gray-500 px-4 rounded-full border border-gray-200 flex items-center gap-2">
                    <Lock size={14} />
                    <span className="text-[10px] font-black uppercase tracking-tight">
                      Locked
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="mt-22 flex-1 bg-white rounded-apple border border-brand-light/20 shadow-sm relative overflow-hidden">
            <div className="h-full w-full flex flex-col items-center justify-center opacity-20 select-none ">
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
      </main>

      <ClassroomSidebar
        layout={layout}
        setLayout={setLayout}
        isSharing={isSharing}
        jwt={jwt}
        roomData={roomData}
        onApiReady={onApiReady}
        isTeacher={isTeacher}
        isLocked={classroomState.isLocked}
      />
    </div>
  );
};

export default MeetingPage;
