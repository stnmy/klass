import { JitsiMeeting } from "@jitsi/react-sdk";

interface SidebarProps {
  layout: "split" | "min-video" | "min-workspace";
  isSharing: boolean;
  jwt: string;
  roomData: any;
  onApiReady: (api: any) => void;
  isTeacher: boolean;
  // removed isLocked as it is now handled in the MeetingHeader
}

const ClassroomSidebar = ({
  layout,
  isSharing,
  jwt,
  roomData,
  onApiReady,
  isTeacher,
}: SidebarProps) => {
  const baseButtons = [
    "microphone",
    "camera",
    "desktop",
    "chat",
    "raisehand",
    "tileview",
    "participants-pane",
    "settings",
    "hangup",
  ];

  const toolbarButtons = isTeacher ? [...baseButtons] : baseButtons;

  let widthClass = "w-[24%]";
  if (layout === "min-video") {
    widthClass = "w-[70px]";
  } else if (layout === "min-workspace") {
    widthClass = "flex-1";
  } else if (isSharing) {
    widthClass = "w-[35%]";
  }

  return (
    <div
      className={`relative h-full transition-all duration-700 ease-in-out ${widthClass}`}
    >
      <aside className="w-full h-full border border-brand-light/20 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden relative">
        <div
          className={`flex-1 transition-all duration-500 overflow-hidden ${
            layout === "min-video"
              ? "opacity-0 invisible"
              : "opacity-100 visible"
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
              disableFocusMode: true, // Prevents Jitsi from overriding our layout
            }}
            getIFrameRef={(el) => {
              if (el) {
                el.style.height = "100%";
                el.style.width = "100%";
                el.style.borderRadius = "inherit";
                const iframe =
                  el.tagName === "IFRAME"
                    ? (el as HTMLIFrameElement)
                    : el.querySelector("iframe");
                if (iframe) {
                  iframe.allow =
                    "camera; microphone; display-capture; autoplay; clipboard-write";
                  iframe.style.borderRadius = "inherit";
                }
              }
            }}
          />
        </div>

        {layout === "min-video" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in fade-in duration-500">
            <p className="text-[10px] font-black uppercase text-brand-deep/10 rotate-90 tracking-widest whitespace-nowrap">
              Video Feed
            </p>
          </div>
        )}
      </aside>
    </div>
  );
};

export default ClassroomSidebar;
