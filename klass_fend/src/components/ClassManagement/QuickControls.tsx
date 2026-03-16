import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // 1. Import createPortal
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  MonitorUp,
  MonitorOff,
  PhoneOff,
  AlertCircle,
  X,
} from "lucide-react";

interface QuickControlsProps {
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isHandRaised: boolean;
  isSharing: boolean;
  showScreenShare: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
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
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    setOptimisticHand(isHandRaised);
  }, [isHandRaised]);

  const handleHandClick = () => {
    const nextState = !optimisticHand;
    setOptimisticHand(nextState);
    onToggleHand(nextState);
  };

  const iconProps = {
    size: 18,
    strokeWidth: 2.2,
  };

  const btnClass =
    "p-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm border focus:outline-none flex items-center justify-center cursor-pointer";

  // --- MODAL COMPONENT ---
  // We define it here but render it via Portal below
  const ExitModal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop - Dims the whole screen */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto"
        onClick={() => setShowExitModal(false)}
      />
      
      {/* Modal Card - Centered exactly in screen */}
      <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl border border-brand-light/20 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 pointer-events-auto">
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6">
            <AlertCircle size={32} />
          </div>
          
          <h3 className="text-xl font-black text-brand-deep uppercase tracking-tight mb-2">
            Leaving so soon?
          </h3>
          <p className="text-sm text-gray-500 font-medium px-4">
            Are you sure you want to exit the live session? You might miss out on important discussion.
          </p>
        </div>

        <div className="flex border-t border-brand-light/10 h-16">
          <button
            onClick={() => setShowExitModal(false)}
            className="flex-1 font-black text-[11px] uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
          <div className="w-px bg-brand-light/10 h-full" />
          <button
            onClick={() => {
              setShowExitModal(false);
              onHangUp();
            }}
            className="flex-1 font-black text-[11px] uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors"
          >
            Yes, Leave
          </button>
        </div>

        <button 
            onClick={() => setShowExitModal(false)}
            className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors"
        >
            <X size={20} />
        </button>
      </div>
    </div>
  );

  return (
    <>
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
          onClick={() => setShowExitModal(true)}
          className={`${btnClass} bg-red-500 border-red-600 text-white hover:bg-red-600 shadow-md active:bg-red-700`}
          title="Leave Class"
        >
          <PhoneOff {...iconProps} />
        </button>
      </div>

      {/* 2. Render the Modal into the document body using a Portal */}
      {showExitModal && createPortal(ExitModal, document.body)}
    </>
  );
};

export default QuickControls;