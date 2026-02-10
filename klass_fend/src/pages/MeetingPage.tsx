import { useEffect, useState, useRef } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import {
  Monitor,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Hand,
} from "lucide-react"; // Added Hand icon
import api from "../api/axios";
import { useUser } from "../context/userContext";
import ClassroomControls from "./ClassroomControls";
import QuickControls from "../components/ClassManagement/QuickControls";

const MeetingPage = () => {
  const { user } = useUser();
  const jitsiApi = useRef<any>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [jwt, setJwt] = useState("");
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<any[]>([]);

  // --- TOAST STATE ---
  const [activeToast, setActiveToast] = useState<{
    name: string;
    id: string;
  } | null>(null);

  // --- JITSI STATUS STATES ---
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  const [roomData, setRoomData] = useState({
    roomName: "",
    appId: "",
    displayName: "",
    email: "",
  });

  const isTeacher = user?.role?.toLowerCase() === "teacher";

  // --- EXTERNAL COMMAND HANDLERS ---
  const handleToggleAudio = () =>
    jitsiApi.current?.executeCommand("toggleAudio");
  const handleToggleVideo = () =>
    jitsiApi.current?.executeCommand("toggleVideo");
  const handleToggleHand = () =>
    jitsiApi.current?.executeCommand("toggleRaiseHand");

  const handleMuteAll = () => {
    jitsiApi.current?.executeCommand("muteEveryone", "audio");
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/user/GetClassroomAccess");
        if (res.status === 200) {
          setJwt(res.data.token);
          setRoomData(res.data);
          setJoined(true);
        }
      } catch (err) {
        console.error("Connection Error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || user === undefined)
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-brand-bg gap-6">
        <div className="w-10 h-10 border-4 border-brand-light/20 border-t-brand-teal rounded-full animate-spin" />
        <p className="text-brand-deep font-black tracking-[0.3em] text-[10px] uppercase">
          Initializing Secure Classroom
        </p>
      </div>
    );

  return (
    <div className="flex h-screen w-full bg-[#F8F9FA] pt-16 overflow-hidden transition-all duration-500">
      {/* --- HAND RAISE TOAST --- */}
      <div
        className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform 
        ${activeToast ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0 pointer-events-none"}`}
      >
        <div className="bg-white border border-yellow-200 shadow-2xl rounded-2xl px-6 py-3 flex items-center gap-3">
          <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
            <Hand size={18} fill="currentColor" />
          </div>
          <p className="text-sm font-bold text-brand-deep">
            <span className="text-yellow-600">{activeToast?.name}</span> raised
            their hand
          </p>
        </div>
      </div>

      <main className="flex-1 flex flex-col relative p-6 lg:p-8">
        {/* Header Overlay */}
        <div className="absolute top-12 left-12 right-12 z-30 flex justify-between items-start pointer-events-none">
          <div className="bg-white/70 backdrop-blur-md border border-brand-light/20 px-3 py-1.5 rounded-full w-fit shadow-sm">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse mr-2 inline-block" />
            <span className="text-[9px] font-black text-brand-deep uppercase tracking-widest">
              Live Session
            </span>
          </div>

          <div className="flex items-center gap-4">
            {joined && isTeacher && (
              <ClassroomControls
                participants={participants}
                onMuteAll={handleMuteAll}
                localDisplayName={roomData.displayName}
              />
            )}
          </div>
        </div>

        {!joined ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-md w-full p-12 bg-white rounded-[3rem] text-center shadow-xl border border-brand-light/10">
              <ShieldAlert size={40} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-brand-deep font-black text-xl uppercase tracking-tighter">
                Access Restricted
              </h3>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-[2.5rem] border border-brand-light/20 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-30" />

            <QuickControls
              isAudioMuted={isAudioMuted}
              isVideoMuted={isVideoMuted}
              isHandRaised={isHandRaised}
              onToggleAudio={handleToggleAudio}
              onToggleVideo={handleToggleVideo}
              onToggleHand={handleToggleHand}
            />

            <div className="h-full w-full flex flex-col items-center justify-center relative z-10">
              <Monitor
                size={60}
                strokeWidth={1}
                className="text-brand-deep opacity-10 mb-4"
              />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-deep opacity-20">
                Interactive Workspace
              </p>
            </div>
          </div>
        )}
      </main>

      {joined && (
        <aside
          className={`relative border-l border-brand-light/10 bg-white shadow-2xl transition-all duration-700 flex flex-col ${isMinimized ? "w-[70px]" : isSharing ? "w-[35%]" : "w-[24%]"}`}
        >
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-50 w-6 h-6 bg-white border border-brand-light/20 rounded-full flex items-center justify-center shadow-md hover:text-brand-teal transition-all"
          >
            {isMinimized ? (
              <ChevronLeft size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>

          <div
            className={`flex-1 transition-all duration-500 ${isMinimized ? "opacity-0 invisible" : "opacity-100 visible"}`}
          >
            <JitsiMeeting
              domain="8x8.vc"
              roomName={`${roomData.appId}/${roomData.roomName}`}
              jwt={jwt}
              onApiReady={(api) => {
                jitsiApi.current = api;

                api.on("screenSharingStatusChanged", (e: object) =>
                  setIsSharing((e as any).on),
                );
                api.on("audioMuteStatusChanged", (e: object) =>
                  setIsAudioMuted((e as any).muted),
                );
                api.on("videoMuteStatusChanged", (e: object) =>
                  setIsVideoMuted((e as any).muted),
                );

                // --- TOAST LOGIC INSIDE EVENT ---
                api.on("raiseHandUpdated", (e: object) => {
                  const data = e as any;
                  const allParticipants = api.getParticipantsInfo();
                  const localParticipant = allParticipants.find(
                    (p: any) => p.local,
                  );

                  // Update local UI button
                  if (localParticipant && data.id === localParticipant.id) {
                    setIsHandRaised(data.handRaised);
                  }

                  // Trigger Toast if handRaised is true
                  if (data.handRaised) {
                    const participant = allParticipants.find(
                      (p: any) => p.id === data.id,
                    );
                    const name = participant?.displayName || "Someone";

                    setActiveToast({ name, id: data.id });

                    // Auto-hide after 4 seconds
                    setTimeout(() => setActiveToast(null), 4000);
                  }
                });

                const updateList = () => {
                  const rawParticipants = api.getParticipantsInfo();
                  const formatted = rawParticipants.map((p: any) => ({
                    id: p.id,
                    displayName: p.displayName || "Student",
                  }));
                  setParticipants(formatted);
                };

                api.on("participantJoined", updateList);
                api.on("participantLeft", updateList);
                api.on("videoConferenceJoined", updateList);
                api.on("displayNameChange", updateList);

                api.executeCommand("subject", " ");
              }}
              // ... rest of your config
              configOverwrite={{
                prejoinPageEnabled: false,
                disableModeratorIndicator: true,
                startWithAudioMuted: false,
                disableInviteFunctions: true,
                toolbarButtons: [
                  "microphone",
                  "camera",
                  "chat",
                  "raisehand",
                  "tileview",
                  "settings",
                  "hangup",
                ],
              }}
              getIFrameRef={(iframe) => {
                if (iframe) {
                  iframe.style.height = "100%";
                  iframe.style.width = "100%";
                }
              }}
            />
          </div>
        </aside>
      )}
    </div>
  );
};

export default MeetingPage;
