import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, SearchX } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="surface-panel max-w-md p-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <SearchX size={28} />
        </div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The route <span className="font-mono text-foreground">{location.pathname}</span> is not available.
        </p>
        <a href="/" className="primary-button mt-6">
          <Home size={16} />
          Return Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
