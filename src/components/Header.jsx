import { Button } from "@/components/ui/button";
import { User, Train } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "react-router-dom";

const Header = () => {
  const { user, logout, department } = useAuth();

  return (
    <header className="relative shadow-md">
      {/* Metro line accent at top */}
      <div className="absolute top-0 left-0 w-full h-5 bg-gradient-to-r from-blue-600 via-pink-500 to-blue-600"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative z-10">
          
          {/* Logo + Title */}
          <div className="flex items-center space-x-3">
            <Train className="h-7 w-7 text-blue-700" />
            <div>
              <h1 className="text-lg font-bold text-blue-700">KMRL DMS</h1>
              <p className="text-xs text-gray-600">Document Management System</p>
              <br />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm" className="hover:text-blue-700">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hover:text-blue-700">
              <Link to="/documents">Documents</Link>
            </Button>

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700 font-medium">
                  {department || "No dept"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-blue-600 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors shadow-sm"
                  onClick={logout}
                >
                  <User className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full border-pink-600 text-pink-700 hover:bg-pink-600 hover:text-white transition-colors shadow-sm"
              >
                <Link to="/login">
                  <User className="h-4 w-4 mr-1" />
                  Login
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
