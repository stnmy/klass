import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Users, Video, LogOut, LayoutDashboard } from "lucide-react";
import api from "../api/axios";

const Navbar = () => {
  const [user, setUser] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [hasActiveSession, setHasActiveSession] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedName = localStorage.getItem("user_name");
    const storedRole = localStorage.getItem("user_role");

    setUser(storedName);
    setRole(storedRole);

    if (storedName) checkSessionStatus();

    const interval = setInterval(() => {
      if (localStorage.getItem("user_name")) checkSessionStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const checkSessionStatus = async () => {
    try {
      const response = await api.get("/user/SessionStatus");
      setHasActiveSession(response.data.status);
    } catch (err) {
      setHasActiveSession(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const isActive = (path: string) => location.pathname === path;

  // NEW: Check if we are currently in the meeting room
  const isMeetingPage = location.pathname === "/meeting";

  const navBtnBase =
    "flex items-center justify-center gap-2 w-40 h-10 rounded-full text-[11px] font-black tracking-widest transition-all duration-300 transform active:scale-95";

  return (
    <nav className="fixed top-0 left-0 w-full bg-brand-bg/80 backdrop-blur-xl border-b border-brand-light/20 z-50">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
        {/* Brand/Logo Section */}
        <div
          className="group flex items-center gap-2 text-2xl font-bold tracking-tighter text-brand-deep cursor-pointer shrink-0"
          onClick={() => navigate("/dashboard")}
        >
          <div className="p-1.5 bg-brand-deep rounded-lg group-hover:rotate-12 transition-transform duration-300 shadow-sm">
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <span>
            Klass<span className="text-brand-teal">.</span>
          </span>
        </div>

        {/* Actions Container */}
        <div className="flex items-center space-x-3">
          {/* TEACHER TOOLS SECTION */}
          {user && role === "Teacher" && (
            <div className="hidden lg:flex items-center gap-3">
              {/* Manage Groups */}
              <Link
                to="/group"
                className={`${navBtnBase} ${
                  isActive("/group")
                    ? "bg-brand-deep text-white shadow-lg shadow-brand-deep/20"
                    : "bg-brand-deep/5 text-brand-deep hover:bg-brand-deep/10 border border-brand-deep/10"
                }`}
              >
                <Users size={14} strokeWidth={2.5} />
                MANAGE GROUPS
              </Link>

              {/* Start Class Button */}
              <button
                onClick={() => navigate("/startClass")}
                className={`${navBtnBase} ${
                  isActive("/startClass")
                    ? "bg-brand-teal text-white shadow-lg shadow-brand-teal/20"
                    : "bg-white border border-brand-light/60 text-brand-deep hover:border-brand-teal hover:text-brand-teal shadow-sm"
                }`}
              >
                <Video size={14} strokeWidth={2.5} />
                {"MANAGE CLASS"}
              </button>
            </div>
          )}

          {/* JOIN CLASS CTA - Now hidden if already on the meeting page */}
          {user && !isMeetingPage && (
            <button
              onClick={() => navigate("/meeting")}
              disabled={!hasActiveSession}
              className={`${navBtnBase} duration-500 
                ${
                  hasActiveSession
                    ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30 hover:scale-105 animate-pulse-subtle"
                    : "bg-brand-light/20 text-brand-muted cursor-not-allowed opacity-60"
                }`}
            >
              <div className="relative flex h-2 w-2 shrink-0">
                {hasActiveSession && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    hasActiveSession ? "bg-white" : "bg-brand-muted"
                  }`}
                ></span>
              </div>
              <span>{hasActiveSession ? "JOIN CLASS" : "NOT AVAILABLE"}</span>
            </button>
          )}

          {/* USER PROFILE & LOGOUT */}
          <div className="flex items-center space-x-5 border-l border-brand-light/30 pl-6 ml-2 shrink-0">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <p className="text-sm font-bold text-brand-deep leading-none mb-1 whitespace-nowrap">
                    {user}
                  </p>
                  <p className="text-[9px] font-black bg-brand-deep/5 px-2 py-0.5 rounded text-brand-muted uppercase tracking-widest">
                    {role}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2.5 text-brand-deep/40 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all duration-300 group"
                  title="Logout"
                >
                  <LogOut
                    size={18}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2 bg-brand-deep text-white text-sm font-bold rounded-full hover:bg-brand-teal transition-all shadow-lg shadow-brand-deep/10"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
