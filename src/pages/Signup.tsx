import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { RadioTower } from "lucide-react";
import { toast } from "sonner";

// Helper for animated BTS Nodes
const BTSNode = ({ top, left, status, delay }: { top: string, left: string, status: "online" | "degraded", delay: number }) => {
  const colorClass = status === "online" ? "bg-emerald-500" : "bg-amber-500";
  const ringColor = status === "online" ? "border-emerald-500" : "border-amber-500";
  
  return (
    <div className="absolute flex items-center justify-center pointer-events-none" style={{ top, left }}>
      <div className={`relative z-10 h-2.5 w-2.5 rounded-full ${colorClass} shadow-[0_0_15px_currentColor]`} />
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

const Signup = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, phone, password })
      });
      const data = await response.json();
      
      if (response.ok) {
        setError("");
        toast.success("Account created successfully!");
        signIn(data.token, data.user.rbac_role || "Read-Only");
        navigate("/dashboard", { replace: true });
      } else {
        setError(data.error || "Failed to create account");
      }
    } catch (err) {
      setError("Server connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background font-sans selection:bg-primary/30">
      
      <div className="absolute inset-0 z-0 opacity-[0.03]">
        <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iNDkiIHZpZXdCb3g9IjAgMCAyOCA0OSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMSI+PHBhdGggZD0iTTEzLjk5IDkuMjVsMTMgNy41djE1bC0xMyA3LjVMMSAxNC45OXYtMTVsMTIuOTktNy41ek0zIDE3Ljl2MTMuMmwxMSA2LjM1IDExLTYuMzVWMTcuOWwtMTEtNi4zNUwzIDE3Ljl6TTAgMTVsMTIuOTgtNy41VjBoLTJ2Ni4zNUwwIDEyLjY5djIuM3ptMCAxOC41TDEyLjk4IDQxdjhoLTJ2LTYuODVMMCAzNS44MXYtMi4zek0xNSAwdjcuNUwyNy45OSAxNUgyOHYtMi4zMWgtLjAxTDE3IDYuMzVWMGgtMnptMCA0OXYtOGwxMi45OS03LjVIMjh2Mi4zMWgtLjAxTDE3IDQyLjE1VjQ5aC0yeiIvPjwvZz48L2c+PC9zdmc+')]"></div>
      </div>

      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--card),0.4)_0%,hsl(var(--background))_100%)] pointer-events-none" />

      <div className="absolute inset-0 z-0 overflow-hidden">
        <BTSNode top="20%" left="15%" status="online" delay={0} />
        <BTSNode top="75%" left="25%" status="online" delay={0.5} />
        <BTSNode top="35%" left="80%" status="online" delay={1.2} />
        <BTSNode top="65%" left="75%" status="degraded" delay={2.1} />
        <BTSNode top="85%" left="50%" status="online" delay={0.8} />
        <BTSNode top="15%" left="55%" status="online" delay={1.7} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass dark:glass-dark relative z-10 flex flex-col items-center justify-center rounded-[3rem] p-12 shadow-[0_0_80px_rgba(0,0,0,0.08)] dark:shadow-[0_0_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:w-[560px]"
      >
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[0_0_30px_rgba(var(--primary),0.2)] border border-primary/20">
            <RadioTower size={32} />
          </div>
          <h1 className="bg-gradient-to-r from-foreground via-muted-foreground to-primary bg-clip-text text-3xl font-light tracking-wide text-transparent">
            Create an Account
          </h1>
        </div>

        <form onSubmit={handleSignup} className="w-full max-w-[340px] space-y-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Full Name / Operator ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-b border-border bg-transparent pb-2 text-center text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="relative">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-border bg-transparent pb-2 text-center text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="relative">
            <input
              type="tel"
              placeholder="Phone Number (Optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border-b border-border bg-transparent pb-2 text-center text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-border bg-transparent pb-2 text-center text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
              required
              minLength={8}
            />
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border-b border-border bg-transparent pb-2 text-center text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
              required
              minLength={8}
            />
          </div>
          
          {error && <p className="text-center text-xs font-semibold text-rose-500 mt-2">{error}</p>}

          <div className="flex items-center justify-center text-xs text-muted-foreground pt-1">
            <button 
              type="button" 
              onClick={() => navigate("/login")}
              className="hover:text-primary transition-colors"
            >
              Already have an account? Log In
            </button>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className="primary-button rounded-xl px-10 py-3 text-xs font-bold tracking-widest min-w-[220px] disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Sign Up"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;
