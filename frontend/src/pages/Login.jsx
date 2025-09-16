import { useState } from "react";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Train, ArrowRight, Mail, Lock } from "lucide-react";
import BackButton from "@/components/BackButton";

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: authError } = await login(email, password);
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 relative overflow-hidden">
      <div className="absolute top-4 left-4 z-20"><BackButton /></div>
      
      {/* Railway Track Lines */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-1/3 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform -rotate-12"></div>
        <div className="absolute bottom-1/3 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform rotate-12"></div>
      </div>

      {/* Decorative Train Icon */}
      <div className="absolute top-10 left-10 opacity-10">
        <Train className="h-20 w-20 text-white" />
      </div>

      {/* Login Card */}
      <Card className="relative z-10 w-full max-w-sm shadow-xl rounded-2xl border-0 bg-white/95 backdrop-blur-md">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            Welcome Back
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Sign in to continue
          </p>
        </CardHeader>

        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4 px-6">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-medium flex items-center gap-1">
                <Mail className="h-3 w-3 text-primary" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-9 text-sm border border-border focus:border-primary transition-colors"
                placeholder="Enter email"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs font-medium flex items-center gap-1">
                <Lock className="h-3 w-3 text-primary" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-9 text-sm border border-border focus:border-primary transition-colors"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600 text-center">{error}</p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col items-stretch gap-3 px-6 pb-6">
            <Button
              type="submit"
              disabled={loading}
              className="h-9 text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  Sign In
                  <ArrowRight className="h-3 w-3" />
                </div>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Don’t have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
