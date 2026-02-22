import { useEffect, useState } from "react";
import { Monitor, Hand, Mic, MicOff, X } from "lucide-react";
import api from "../api/axios";
import { useUser } from "../context/userContext";
import { useJitsi } from "../components/ClassManagement/useJitsi";
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

  const isTeacher = user?.role?.toLowerCase() === "teacher";

  const {
    onApiReady,
    participants,
    isAudioMuted,
    isVideoMuted,
    isHandRaised,
    activeToast,
    isSharing,
    activeNotification,
    setActiveNotification,
    execute,
  } = useJitsi(isTeacher);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/user/GetClassroomAccess");
        if (res.status === 200) {
          setJwt(res.data.token);
          setRoomData(res.data);
        }
      } catch (err) {
        console.error("Access Error", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingScreen />;
  if (!roomData)
    return (
      <div className="h-screen flex items-center justify-center bg-brand-bg text-brand-deep font-black uppercase">
        Access Denied
      </div>
    );

  return (
    <div className="relative flex h-screen w-full bg-[#F8F9FA] pt-16 overflow-hidden">
      {/* --- NOTIFICATIONS --- */}
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
        {activeToast && (
          <div className="bg-white border border-yellow-200 shadow-xl rounded-2xl px-6 py-3 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 pointer-events-auto">
            <Hand size={18} className="text-yellow-600" fill="currentColor" />
            <p className="text-sm font-bold text-brand-deep">
              <span className="text-yellow-600 font-black">
                {activeToast.name}
              </span>{" "}
              raised their hand
            </p>
          </div>
        )}
      </div>

      {/* --- WORKSPACE (LEFT) --- */}
      <main
        className={`relative flex flex-col transition-all duration-700 ease-in-out border-r border-brand-light/10 ${layout === "min-workspace" ? "w-17.5 p-0 overflow-hidden" : "flex-1 p-6 lg:p-8"}`}
      >
        <div
          className={`flex-1 flex flex-col transition-opacity duration-300 ${layout === "min-workspace" ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <div className="absolute top-12 left-12 right-12 z-30 flex justify-between items-start pointer-events-none">
            <div className="bg-white/80 backdrop-blur-md border border-brand-light/20 px-4 py-2 rounded-full shadow-sm pointer-events-auto flex items-center gap-3">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" />
              <span className="text-[10px] font-black text-brand-deep uppercase tracking-widest">
                Live Session
              </span>
            </div>
            <div className="pointer-events-auto flex gap-3">
              {isTeacher && (
                <ClassroomControls
                  participants={participants}
                  onMuteAll={() => execute("muteEveryone", "audio")}
                  onForceMute={(id) => {
                    execute("muteRemoteParticipant", id, "audio");
                    execute("rejectModeration", id, "audio");
                  }}
                  onRequestUnmute={(id) => execute("askToUnmute", id)}
                  localDisplayName={roomData.displayName}
                />
              )}
            </div>
          </div>

          <div className="flex-1 bg-white rounded-apple border border-brand-light/20 shadow-sm relative overflow-hidden">
            <QuickControls
              isAudioMuted={isAudioMuted}
              isVideoMuted={isVideoMuted}
              isHandRaised={isHandRaised}
              isSharing={isSharing}
              showScreenShare={isTeacher}
              onToggleAudio={() => execute("toggleAudio")}
              onToggleVideo={() => execute("toggleVideo")}
              onToggleHand={() => execute("toggleRaiseHand")}
              onToggleShare={() => execute("toggleShareScreen")}
            />
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
      </main>

      {/* --- JITSI (RIGHT) --- */}
      <ClassroomSidebar
        layout={layout}
        setLayout={setLayout}
        isSharing={isSharing}
        jwt={jwt}
        roomData={roomData}
        onApiReady={onApiReady}
        isTeacher={isTeacher}
      />
    </div>
  );
};

export default MeetingPage;
