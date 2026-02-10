import { Link } from "react-router-dom";
import { MapPinOff, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-in fade-in zoom-in-95 duration-500">
      {/* Icon with a subtle glow */}
      <div className="mb-8 p-8 bg-white rounded-[3rem] border border-brand-light/20 shadow-xl shadow-brand-deep/5 relative">
        <div className="absolute inset-0 bg-brand-teal/5 blur-2xl rounded-full" />
        <MapPinOff
          size={48}
          className="text-brand-teal relative z-10 stroke-[1.5]"
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-5xl font-black text-brand-deep tracking-tighter">
          404
        </h2>
        <h3 className="text-xl font-bold text-brand-deep uppercase tracking-widest">
          Route Not Found
        </h3>
        <p className="max-w-xs mx-auto text-brand-muted text-xs font-bold leading-relaxed uppercase tracking-widest opacity-70">
          The requested destination is outside our current curriculum map.
        </p>
      </div>

      <div className="mt-12">
        <Link
          to="/dashboard"
          className="group flex items-center gap-3 px-8 py-4 bg-brand-deep text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-brand-teal transition-all duration-300 shadow-xl shadow-brand-deep/20 active:scale-95"
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Home
        </Link>
      </div>

      {/* Decorative background element */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-light/10 to-transparent pointer-events-none -z-10" />
    </div>
  );
};

export default NotFound;
