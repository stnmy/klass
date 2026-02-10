import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // Adjust this path to your axios instance

const Navbar = () => {
  const [user, setUser] = useState<string | null>(null);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem("user_name");
    setUser(storedName);

    // Initial check for session status
    if (storedName) {
      checkSessionStatus();
    }

    // Poll every 30 seconds to catch when a teacher starts a class
    const interval = setInterval(() => {
      if (localStorage.getItem("user_name")) {
        checkSessionStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const checkSessionStatus = async () => {
    try {
      const response = await api.get("/user/SessionStatus");
      // Matches your backend return: return Ok(new { status });
      setHasActiveSession(response.data.status);
    } catch (err) {
      console.error("Session check failed", err);
      setHasActiveSession(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-brand-bg/80 backdrop-blur-xl border-b border-brand-light/20 z-50">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          className="text-2xl font-bold tracking-tighter text-brand-deep cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          Klass<span className="text-brand-muted">.</span>
        </div>

        {/* Links & Session Action */}
        <div className="flex items-center space-x-8">
          {user && (
            <button
              onClick={() => navigate("/meeting")}
              disabled={!hasActiveSession}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all duration-500 transform 
                ${
                  hasActiveSession
                    ? "bg-brand-teal text-white shadow-lg shadow-brand-teal/20 hover:scale-105 active:scale-95 animate-pulse-subtle"
                    : "bg-brand-light/20 text-brand-muted cursor-not-allowed opacity-60"
                }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${hasActiveSession ? "bg-white animate-ping" : "bg-brand-muted"}`}
              />
              {hasActiveSession ? "JOIN ACTIVE CLASS" : "NO LIVE CLASS"}
            </button>
          )}

          <div className="hidden md:flex items-center space-x-10 text-[14px] font-medium text-brand-deep/70">
            <a
              href="/dashboard"
              className="hover:text-brand-teal transition-colors"
            >
              Home
            </a>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-6 border-l border-brand-light/30 pl-6">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-brand-deep">
                  Hi, {user}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-5 py-1.5 border border-brand-deep/20 text-brand-deep text-xs font-bold rounded-full hover:bg-brand-deep hover:text-white transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="px-6 py-2 bg-brand-deep text-white text-sm font-bold rounded-full hover:bg-brand-teal transition-all transform hover:scale-105 duration-300 shadow-lg shadow-brand-deep/10"
              >
                Get Started
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
