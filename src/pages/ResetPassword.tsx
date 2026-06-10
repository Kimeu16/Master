import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RadioTower } from "lucide-react";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessage("Password successfully reset! Redirecting to login...");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (err) {
      setError("Server connection failed");
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

      {/* Main Glassmorphism Hub */}
      <div className="glass dark:glass-dark relative z-10 flex flex-col items-center justify-center rounded-[3rem] p-12 shadow-[0_0_80px_rgba(0,0,0,0.08)] dark:shadow-[0_0_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:w-[560px]">
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[0_0_30px_rgba(var(--primary),0.2)] border border-primary/20">
            <RadioTower size={32} />
          </div>
          <h1 className="bg-gradient-to-r from-foreground via-muted-foreground to-primary bg-clip-text text-3xl font-light tracking-wide text-transparent">
            Reset Password
          </h1>
        </div>

        {!token ? (
          <p className="text-rose-500 text-sm font-semibold">{error}</p>
        ) : (
          <form onSubmit={handleReset} className="w-full max-w-[340px] space-y-8">
            <div className="relative">
              <input
                type="password"
                placeholder="New Password"
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
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border-b border-border bg-transparent pb-2 text-center text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
                required
                minLength={8}
              />
            </div>
            
            {error && <p className="text-center text-xs font-semibold text-rose-500 mt-2">{error}</p>}
            {message && <p className="text-center text-xs font-semibold text-emerald-500 mt-2">{message}</p>}

            <div className="pt-6 flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="primary-button rounded-xl px-10 py-3 text-xs font-bold tracking-widest min-w-[220px] disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Update Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
