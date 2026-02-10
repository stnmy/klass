import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authservice";

const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await login({ userName, password });
      localStorage.setItem("user_name", response.userName);
      localStorage.setItem("user_role", response.role);
      navigate("/dashboard");
      window.location.reload();
    } catch (err: any) {
      setError(err?.response?.data ?? "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-6">
      <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold tracking-tight text-brand-deep mb-3">
            Sign in to Klass
          </h2>
          <p className="text-brand-muted font-medium">
            Enter your details to continue.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/70 border border-brand-light/30 rounded-apple p-10 backdrop-blur-md shadow-2xl shadow-brand-deep/5">
          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.15em] font-bold text-brand-deep/80 ml-1">
                Username
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="w-full px-6 py-4 rounded-apple-inner bg-brand-bg/50 border border-brand-light/20 text-brand-deep placeholder-brand-muted/40 focus:outline-none focus:ring-4 focus:ring-brand-light/10 focus:border-brand-muted transition-all duration-300"
                placeholder="johndoe"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.15em] font-bold text-brand-deep/80 ml-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-6 py-4 rounded-apple-inner bg-brand-bg/50 border border-brand-light/20 text-brand-deep placeholder-brand-muted/40 focus:outline-none focus:ring-4 focus:ring-brand-light/10 focus:border-brand-muted transition-all duration-300"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 text-xs font-bold py-3 px-4 rounded-xl text-center animate-in zoom-in-95">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-apple-inner font-bold text-white text-base transition-all transform hover:scale-[1.01] active:scale-[0.98] shadow-xl shadow-brand-deep/15
              ${loading ? "bg-brand-muted cursor-wait" : "bg-brand-deep hover:bg-brand-teal"}`}
            >
              {loading ? "Verifying..." : "Continue"}
            </button>
          </form>
        </div>
        <p className="mt-10 text-center text-brand-muted/80 text-sm font-medium">
          Don't have an account?{" "}
          <button className="text-brand-deep font-bold hover:underline">
            Create yours.
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
