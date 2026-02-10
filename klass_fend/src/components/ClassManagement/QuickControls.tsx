import { Mic, MicOff, Video, VideoOff, Hand } from "lucide-react";

const QuickControls = ({
  isAudioMuted,
  onToggleAudio, // Matching the props used in MeetingPage
  isVideoMuted,
  onToggleVideo,
  isHandRaised,
  onToggleHand,
}: any) => {
  const btnClass =
    "p-3 rounded-xl transition-all active:scale-90 shadow-sm border";

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-3 bg-white/80 backdrop-blur-md p-2 rounded-[1.5rem] border border-brand-light/20 shadow-xl pointer-events-auto">
      <button
        onClick={onToggleAudio}
        className={`${btnClass} ${isAudioMuted ? "bg-red-50 border-red-100 text-red-500" : "bg-brand-bg border-brand-light/10 text-brand-deep hover:bg-white"}`}
      >
        {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
      </button>

      <button
        onClick={onToggleVideo}
        className={`${btnClass} ${isVideoMuted ? "bg-red-50 border-red-100 text-red-500" : "bg-brand-bg border-brand-light/10 text-brand-deep hover:bg-white"}`}
      >
        {isVideoMuted ? <VideoOff size={20} /> : <Video size={20} />}
      </button>

      <button
        onClick={onToggleHand}
        className={`${btnClass} ${isHandRaised ? "bg-yellow-50 border-yellow-200 text-yellow-600" : "bg-brand-bg border-brand-light/10 text-brand-deep hover:bg-white"}`}
      >
        <Hand size={20} fill={isHandRaised ? "currentColor" : "none"} />
      </button>
    </div>
  );
};

export default QuickControls;
