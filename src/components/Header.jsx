import { Button } from "@/components/ui/button";
import { FileText, Menu, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "react-router-dom";

const Header = () => {
  const { user, logout, department } = useAuth();
  return (
    <header className="bg-card shadow-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">KMRL DMS</h1>
                <p className="text-xs text-muted-foreground">Document Management System</p>
              </div>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/documents">Documents</Link>
            </Button>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{department || "No dept"}</span>
                <Button variant="outline" size="sm" onClick={logout}>
                  <User className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link to="/login">
                  <User className="h-4 w-4 mr-2" />
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