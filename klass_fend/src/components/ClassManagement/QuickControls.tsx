import { Mic, MicOff, Video, VideoOff, Hand } from "lucide-react";

interface QuickControlsProps {
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isHandRaised: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleHand: () => void;
}

const QuickControls = ({
  isAudioMuted,
  onToggleAudio,
  isVideoMuted,
  onToggleVideo,
  isHandRaised,
  onToggleHand,
}: QuickControlsProps) => {
  const btnClass =
    "p-3 rounded-xl transition-all active:scale-90 shadow-sm border focus:outline-none";

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-3 bg-white/80 backdrop-blur-md p-2 rounded-[1.5rem] border border-brand-light/20 shadow-xl pointer-events-auto">
      {/* Mic Control */}
      <button
        onClick={onToggleAudio}
        className={`${btnClass} ${
          isAudioMuted
            ? "bg-red-50 border-red-100 text-red-500 hover:bg-red-100"
            : "bg-brand-bg border-brand-light/10 text-brand-deep hover:bg-white"
        }`}
        title={isAudioMuted ? "Unmute Microphone" : "Mute Microphone"}
      >
        {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
      </button>

      {/* Video Control */}
      <button
        onClick={onToggleVideo}
        className={`${btnClass} ${
          isVideoMuted
            ? "bg-red-50 border-red-100 text-red-500 hover:bg-red-100"
            : "bg-brand-bg border-brand-light/10 text-brand-deep hover:bg-white"
        }`}
        title={isVideoMuted ? "Start Video" : "Stop Video"}
      >
        {isVideoMuted ? <VideoOff size={20} /> : <Video size={20} />}
      </button>

      {/* Hand Control */}
      <button
        onClick={onToggleHand}
        className={`${btnClass} ${
          isHandRaised
            ? "bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100"
            : "bg-brand-bg border-brand-light/10 text-brand-deep hover:bg-white"
        }`}
        title={isHandRaised ? "Lower Hand" : "Raise Hand"}
      >
        <Hand size={20} fill={isHandRaised ? "currentColor" : "none"} />
      </button>
    </div>
  );
};

export default QuickControls;
