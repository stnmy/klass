import { Mic, MicOff, X, Hand } from "lucide-react";

const NotificationOverlay = ({
  activeNotification,
  setActiveNotification,
}: any) => {
  if (!activeNotification?.visible) return null;

  const type = activeNotification.type;

  // 1. Define the mapping outside or before the variable logic
  const NOTIFICATION_MAP = {
    "unmute-request": {
      icon: <Mic size={20} className="animate-pulse" />,
      color: "border-brand-teal",
      bgColor: "bg-brand-teal/10 text-brand-teal",
      title: "Permission Granted",
    },
    "muted-by-teacher": {
      icon: <MicOff size={20} />,
      color: "border-red-400",
      bgColor: "bg-red-50/80 text-red-500",
      title: "Audio Update",
    },
    "hand-raised": {
      icon: <Hand size={20} />,
      color: "border-brand-teal",
      bgColor: "bg-brand-teal/10 text-brand-teal",
      title: "Hand Raised",
    },
  };

  // 2. Access the config safely
  // We use the 'muted-by-teacher' as the default fallback key
  const currentConfig =
    NOTIFICATION_MAP[type as keyof typeof NOTIFICATION_MAP] ||
    NOTIFICATION_MAP["muted-by-teacher"];

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[10000] flex flex-col items-center w-full max-w-md px-4 pointer-events-none">
      <div
        className={`flex items-center gap-4 p-4 rounded-3xl shadow-2xl border-2 animate-in slide-in-from-top-4 duration-300 w-full bg-white/95 backdrop-blur-sm pointer-events-auto ${currentConfig.color}`}
      >
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${currentConfig.bgColor}`}
        >
          {currentConfig.icon}
        </div>

        <div className="flex-1">
          <h4 className="text-[10px] font-black uppercase tracking-tighter text-brand-deep">
            {currentConfig.title}
          </h4>
          <p className="text-[11px] text-gray-500 font-medium leading-tight">
            {activeNotification.message ||
              (type === "unmute-request"
                ? "You can now unmute your microphone."
                : "A student needs attention.")}
          </p>
        </div>

        <button
          onClick={() => setActiveNotification(null)}
          className="text-gray-300 hover:text-gray-500 p-1 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default NotificationOverlay;
