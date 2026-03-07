import { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  MonitorUp,
  MonitorOff,
  PhoneOff, // Added for the Hang Up button
} from "lucide-react";

interface QuickControlsProps {
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isHandRaised: boolean;
  isSharing: boolean;
  showScreenShare: boolean;
  isStrictMode: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleHand: () => void;
  onToggleShare: () => void;
  onHangUp: () => void; // Added new prop
}

const QuickControls = ({
  isAudioMuted,
  onToggleAudio,
  isVideoMuted,
  onToggleVideo,
  isHandRaised,
  onToggleHand,
  isSharing,
  showScreenShare,
  onToggleShare,
  onHangUp, // Destructured new prop
}: QuickControlsProps) => {
  const [localHandRaised, setLocalHandRaised] = useState(isHandRaised);

  useEffect(() => {
    setLocalHandRaised(isHandRaised);
  }, [isHandRaised]);

  const handleHandClick = () => {
    setLocalHandRaised(!localHandRaised);
    onToggleHand();
  };

  const iconProps = {
    size: 18,
    strokeWidth: 2.2,
  };

  const btnClass =
    "p-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm border focus:outline-none flex items-center justify-center cursor-pointer";

  return (
    <div className="flex gap-2.5 bg-white/90 backdrop-blur-md p-2 rounded-[22px] border border-brand-light/20 shadow-xl pointer-events-auto w-max transition-all duration-300">
      {/* Mic Control */}
      <button
        onClick={onToggleAudio}
        className={`${btnClass} ${
          isAudioMuted
            ? "bg-red-50 border-red-100 text-red-500 hover:bg-red-100"
            : "bg-brand-bg border-brand-light/10 text-brand-deep hover:bg-white"
        }`}
      >
        {isAudioMuted ? <MicOff {...iconProps} /> : <Mic {...iconProps} />}
      </button>

      {/* Video Control */}
      <button
        onClick={onToggleVideo}
        className={`${btnClass} ${
          isVideoMuted
            ? "bg-red-50 border-red-100 text-red-500 hover:bg-red-100"
            : "bg-brand-bg border-brand-light/10 text-brand-deep hover:bg-white"
        }`}
      >
        {isVideoMuted ? <VideoOff {...iconProps} /> : <Video {...iconProps} />}
      </button>

      {/* Screen Share */}
      {showScreenShare && (
        <button
          onClick={onToggleShare}
          className={`${btnClass} ${
            isSharing
              ? "bg-brand-teal text-white border-brand-teal shadow-md"
              : "bg-brand-bg border-brand-light/10 text-brand-deep hover:bg-white"
          }`}
        >
          {isSharing ? (
            <MonitorOff {...iconProps} />
          ) : (
            <MonitorUp {...iconProps} />
          )}
        </button>
      )}

      {/* Hand Control */}
      <button
        onClick={handleHandClick}
        className={`${btnClass} relative overflow-hidden transition-all duration-300 ${
          localHandRaised
            ? "bg-brand-deep border-brand-deep text-white shadow-lg scale-105"
            : "bg-brand-bg border-brand-light/10 text-brand-deep hover:bg-white"
        }`}
      >
        <Hand
          {...iconProps}
          fill={localHandRaised ? "white" : "none"}
          className={`transition-all duration-300 ${
            localHandRaised ? "rotate-[15deg] scale-110" : ""
          }`}
        />
        {localHandRaised && (
          <span className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
        )}
      </button>

      {/* Vertical Divider */}
      <div className="w-[1px] h-auto bg-brand-light/20 mx-0.5" />

      {/* Hang Up Button */}
      <button
        onClick={onHangUp}
        className={`${btnClass} bg-red-500 border-red-600 text-white hover:bg-red-600 shadow-md active:bg-red-700`}
        title="Leave Class"
      >
        <PhoneOff {...iconProps} />
      </button>
    </div>
  );
};

export default QuickControls;
