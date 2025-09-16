import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import BackButton from "@/components/BackButton";
import PageShell from "@/components/PageShell";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageShell>
      <div className="relative">
        <div className="absolute top-0 left-0"><BackButton /></div>
        <div className="text-center py-24">
          <h1 className="mb-2 text-5xl font-extrabold text-gray-800">404</h1>
          <p className="mb-6 text-lg text-gray-600">Oops! Page not found</p>
          <a href="/" className="text-primary underline hover:opacity-80">Return to Home</a>
        </div>
      </div>
    </PageShell>
  );
};

export default NotFound;
