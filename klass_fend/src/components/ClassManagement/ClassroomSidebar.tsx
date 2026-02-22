import { JitsiMeeting } from "@jitsi/react-sdk";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps {
  layout: "split" | "min-video" | "min-workspace";
  setLayout: (val: "split" | "min-video" | "min-workspace") => void;
  isSharing: boolean;
  jwt: string;
  roomData: any;
  onApiReady: (api: any) => void;
  isTeacher: boolean;
}

const ClassroomSidebar = ({
  layout,
  setLayout,
  isSharing,
  jwt,
  roomData,
  onApiReady,
  isTeacher,
}: SidebarProps) => {
  const baseButtons = [
    "microphone",
    "camera",
    "chat",
    "raisehand",
    "tileview",
    "participants-pane",
    "settings",
    "hangup",
  ];

  const toolbarButtons = isTeacher ? [...baseButtons, "desktop"] : baseButtons;

  // Dynamic Width Calculation
  let widthClass = "w-[24%]";
  if (layout === "min-video") {
    widthClass = "w-[70px]";
  } else if (layout === "min-workspace") {
    widthClass = "flex-1";
  } else if (isSharing) {
    widthClass = "w-[35%]";
  }

  return (
    <aside
      className={`relative border-l border-brand-light/10 bg-white shadow-2xl transition-all duration-700 ease-in-out flex flex-col 
      ${widthClass}`}
    >
      {/* --- DIRECTIONAL TOGGLE GROUP --- */}
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
        {/* BUTTON: Expand Workspace (Minimize Video) */}
        <button
          onClick={() =>
            setLayout(layout === "min-video" ? "split" : "min-video")
          }
          className={`w-8 h-8 rounded-full border border-brand-light/20 flex items-center justify-center shadow-md transition-all
            ${layout === "min-video" ? "bg-brand-teal text-white" : "bg-white text-brand-deep hover:bg-brand-bg"}`}
          title="Expand Workspace"
        >
          <ChevronRight size={16} />
        </button>

        {/* BUTTON: Expand Video (Minimize Workspace) */}
        <button
          onClick={() =>
            setLayout(layout === "min-workspace" ? "split" : "min-workspace")
          }
          className={`w-8 h-8 rounded-full border border-brand-light/20 flex items-center justify-center shadow-md transition-all
            ${layout === "min-workspace" ? "bg-brand-teal text-white" : "bg-white text-brand-deep hover:bg-brand-bg"}`}
          title="Maximize Video"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Jitsi Wrapper */}
      <div
        className={`flex-1 transition-all duration-500 ${
          layout === "min-video" ? "opacity-0 invisible" : "opacity-100 visible"
        }`}
      >
        <JitsiMeeting
          domain="8x8.vc"
          roomName={`${roomData.appId}/${roomData.roomName}`}
          jwt={jwt}
          userInfo={{
            displayName: roomData.displayName,
            email: roomData.email,
          }}
          onApiReady={onApiReady}
          configOverwrite={{
            prejoinPageEnabled: false,
            prejoinConfig: { enabled: false },
            startWithAudioMuted: true,
            startWithVideoMuted: true,
            disableRemoteMute: false,
            remoteVideoMenu: { disableMute: false },
            toolbarButtons: toolbarButtons,
            disableResponsiveTiles: false,
          }}
          getIFrameRef={(el) => {
            if (el) {
              el.style.height = "100%";
              el.style.width = "100%";
              const iframe =
                el.tagName === "IFRAME"
                  ? (el as HTMLIFrameElement)
                  : el.querySelector("iframe");

              if (iframe) {
                iframe.allow =
                  "camera; microphone; display-capture; autoplay; clipboard-write";
              }
            }
          }}
        />
      </div>

      {/* Vertical Placeholder for Minimized State */}
      {layout === "min-video" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-[10px] font-black uppercase text-brand-deep/20 rotate-90 tracking-widest whitespace-nowrap">
            Video Feed
          </p>
        </div>
      )}
    </aside>
  );
};

export default ClassroomSidebar;
