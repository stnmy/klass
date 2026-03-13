import { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  MonitorUp,
  MonitorOff,
  PhoneOff,
} from "lucide-react";

interface QuickControlsProps {
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isHandRaised: boolean;
  isSharing: boolean;
  showScreenShare: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  // UPDATED: Now accepts the intended state as a boolean
  onToggleHand: (newState: boolean) => void;
  onToggleShare: () => void;
  onHangUp: () => void;
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
  onHangUp,
}: QuickControlsProps) => {
  const [optimisticHand, setOptimisticHand] = useState(isHandRaised);

  useEffect(() => {
    setOptimisticHand(isHandRaised);
  }, [isHandRaised]);

  const handleHandClick = () => {
    // 1. Calculate the NEW state locally
    const nextState = !optimisticHand;

    // 2. Update UI immediately for snappiness
    setOptimisticHand(nextState);

    // 3. Pass that EXACT boolean to the parent handler
    onToggleHand(nextState);
  };

  const iconProps = {
    size: 18,
    strokeWidth: 2.2,
  };

  const btnClass =
    "p-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm border focus:outline-none flex items-center justify-center cursor-pointer";

  return (
    <div className="flex gap-2.5 bg-white/90 backdrop-blur-md p-2 rounded-[22px] border border-brand-light/20 shadow-xl pointer-events-auto w-max transition-all duration-300">
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

      <button
        onClick={handleHandClick}
        className={`${btnClass} relative overflow-hidden transition-all duration-300 ${
          optimisticHand
            ? "bg-brand-deep border-brand-deep text-white shadow-lg scale-105"
            : "bg-brand-bg border-brand-light/10 text-brand-deep hover:bg-white"
        }`}
      >
        <Hand
          {...iconProps}
          fill={optimisticHand ? "white" : "none"}
          className={`transition-all duration-300 ${
            optimisticHand ? "rotate-15deg scale-110" : ""
          }`}
        />
        {optimisticHand && (
          <span className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
        )}
      </button>

      <div className="w-px h-auto bg-brand-light/20 mx-0.5" />

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
