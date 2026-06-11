import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth, Role } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { RadioTower } from "lucide-react";

// Helper for animated BTS Nodes
const BTSNode = ({ top, left, status, delay }: { top: string, left: string, status: "online" | "degraded", delay: number }) => {
  const colorClass = status === "online" ? "bg-emerald-500" : "bg-amber-500";
  const ringColor = status === "online" ? "border-emerald-500" : "border-amber-500";
  
  return (
    <div className="absolute flex items-center justify-center pointer-events-none" style={{ top, left }}>
      {/* Central Tower Node */}
      <div className={`relative z-10 h-2.5 w-2.5 rounded-full ${colorClass} shadow-[0_0_15px_currentColor]`} />
      
      {/* RF Rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.5, scale: 0.5 }}
          animate={{ opacity: 0, scale: 5 }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: delay + (i * 1.33),
            ease: "easeOut"
          }}
          className={`absolute h-16 w-16 rounded-full border ${ringColor} opacity-50`}
        />
      ))}
    </div>
  );
};

const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      
      if (response.ok) {
        setError("");
        signIn(data.token, data.user.rbac_role);
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      } else {
        setError(data.error || "Invalid username or password");
      }
    } catch (err) {
      setError("Server connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResetMessage("");
    try {
      const response = await fetch("http://127.0.0.1:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await response.json();
      setResetMessage(data.message || "Request sent");
    } catch (err) {
      setResetMessage("Server connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background font-sans selection:bg-primary/30">
      
      {/* Hexagonal Background Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03]">
        <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iNDkiIHZpZXdCb3g9IjAgMCAyOCA0OSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMSI+PHBhdGggZD0iTTEzLjk5IDkuMjVsMTMgNy41djE1bC0xMyA3LjVMMSAxNC45OXYtMTVsMTIuOTktNy41ek0zIDE3Ljl2MTMuMmwxMSA2LjM1IDExLTYuMzVWMTcuOWwtMTEtNi4zNUwzIDE3Ljl6TTAgMTVsMTIuOTgtNy41VjBoLTJ2Ni4zNUwwIDEyLjY5djIuM3ptMCAxOC41TDEyLjk4IDQxdjhoLTJ2LTYuODVMMCAzNS44MXYtMi4zek0xNSAwdjcuNUwyNy45OSAxNUgyOHYtMi4zMWgtLjAxTDE3IDYuMzVWMGgtMnptMCA0OXYtOGwxMi45OS03LjVIMjh2Mi4zMWgtLjAxTDE3IDQyLjE1VjQ5aC0yeiIvPjwvZz48L2c+PC9zdmc+')]"></div>
      </div>

      {/* Atmospheric Cartographic / Gradient overlay */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--card),0.4)_0%,hsl(var(--background))_100%)] pointer-events-none" />

      {/* BTS Nodes (RF Propagation) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <BTSNode top="20%" left="15%" status="online" delay={0} />
        <BTSNode top="75%" left="25%" status="online" delay={0.5} />
        <BTSNode top="35%" left="80%" status="online" delay={1.2} />
        <BTSNode top="65%" left="75%" status="degraded" delay={2.1} />
        <BTSNode top="85%" left="50%" status="online" delay={0.8} />
        <BTSNode top="15%" left="55%" status="online" delay={1.7} />
      </div>

      {/* Main Glassmorphism Hub */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass dark:glass-dark relative z-10 flex flex-col items-center justify-center rounded-[3rem] p-12 shadow-[0_0_80px_rgba(0,0,0,0.08)] dark:shadow-[0_0_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:h-[560px] sm:w-[560px]"
      >
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[0_0_30px_rgba(var(--primary),0.2)] border border-primary/20">
            <RadioTower size={32} />
          </div>
          <h1 className="bg-gradient-to-r from-foreground via-muted-foreground to-primary bg-clip-text text-3xl font-light tracking-wide text-transparent">
            AlanDick Ops Console
          </h1>
        </div>

        {isForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="w-full max-w-[340px] space-y-8">
            <div className="relative">
              <input
                type="email"
                placeholder="Registered Email Address"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full border-b border-border bg-transparent pb-2 text-center text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>
            {resetMessage && <p className="text-center text-xs font-semibold text-primary mt-2">{resetMessage}</p>}
            <div className="pt-6 flex flex-col gap-4 items-center">
              <button
                type="submit"
                disabled={isLoading}
                className="primary-button rounded-xl px-10 py-3 text-xs font-bold tracking-widest text-white min-w-[220px] disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
              <button 
                type="button" 
                onClick={() => { setIsForgotPassword(false); setResetMessage(""); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="w-full max-w-[340px] space-y-8">
            {/* Simulated Username */}
            <div className="relative">
              <input
                type="text"
                placeholder="Operator ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border-b border-border bg-transparent pb-2 text-center text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Simulated Password */}
            <div className="relative">
              <input
                type="password"
                placeholder="Passcode"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-border bg-transparent pb-2 text-center text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>
            
            {error && <p className="text-center text-xs font-semibold text-rose-500 mt-2">{error}</p>}

            {/* Links Row */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <label className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors">
                <input type="checkbox" className="rounded border-border bg-card/50 text-primary focus:ring-primary h-[13px] w-[13px]" defaultChecked />
                Keep session active
              </label>
              <button 
                type="button" 
                onClick={() => setIsForgotPassword(true)}
                className="hover:text-primary transition-colors"
              >
                Forgot Password
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-6 flex flex-col gap-4 items-center">
              <button
                type="submit"
                disabled={isLoading}
                className="primary-button rounded-xl px-10 py-3 text-xs font-bold tracking-widest min-w-[220px] disabled:opacity-50"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
