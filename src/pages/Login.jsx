import { useState } from "react";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Train, FileText, ArrowRight, Mail, Lock } from "lucide-react";

const Login = () => {
	const { login, user } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const from = location.state?.from?.pathname || "/dashboard";
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
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
			{/* Background Railway Elements */}
			<div className="absolute inset-0 opacity-5">
				<div className="absolute top-20 left-10 w-32 h-32 border-4 border-primary rounded-full"></div>
				<div className="absolute bottom-20 right-10 w-24 h-24 border-4 border-secondary rounded-full"></div>
				<div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-primary transform rotate-45"></div>
				<div className="absolute top-1/3 right-1/4 w-20 h-20 border-2 border-secondary transform rotate-12"></div>
			</div>

			{/* Railway Track Lines */}
			<div className="absolute inset-0 overflow-hidden opacity-10">
				<div className="absolute top-1/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent transform -rotate-12"></div>
				<div className="absolute bottom-1/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent transform rotate-12"></div>
			</div>

			<div className="relative z-10 w-full max-w-md">
				{/* Header Section */}
				<div className="text-center mb-8">
					<div className="flex items-center justify-center mb-4">
						<div className="p-3 bg-primary/10 rounded-full mr-3">
							<Train className="h-8 w-8 text-primary" />
						</div>
						<div className="p-3 bg-secondary/10 rounded-full">
							<FileText className="h-8 w-8 text-secondary" />
						</div>
					</div>
					<h1 className="text-3xl font-bold text-foreground mb-2">KMRL DMS</h1>
					<p className="text-muted-foreground">Kochi Metro Rail Document Management</p>
					<div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mt-4 rounded-full"></div>
				</div>

				<Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
					<CardHeader className="text-center pb-4">
						<CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
							<Lock className="h-5 w-5 text-primary" />
							Welcome Back
						</CardTitle>
						<p className="text-sm text-muted-foreground mt-2">
							Sign in to access your documents
						</p>
					</CardHeader>
					
					<form onSubmit={onSubmit}>
						<CardContent className="space-y-6 px-8">
							<div className="space-y-2">
								<Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
									<Mail className="h-4 w-4 text-primary" />
									Email Address
								</Label>
								<Input 
									id="email" 
									type="email" 
									value={email} 
									onChange={(e) => setEmail(e.target.value)} 
									required 
									className="h-12 border-2 border-border focus:border-primary transition-colors"
									placeholder="Enter your email"
								/>
							</div>
							
							<div className="space-y-2">
								<Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
									<Lock className="h-4 w-4 text-primary" />
									Password
								</Label>
								<Input 
									id="password" 
									type="password" 
									value={password} 
									onChange={(e) => setPassword(e.target.value)} 
									required 
									className="h-12 border-2 border-border focus:border-primary transition-colors"
									placeholder="Enter your password"
								/>
							</div>
							
							{error && (
								<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
									<p className="text-sm text-red-600 text-center">{error}</p>
								</div>
							)}
						</CardContent>
						
						<CardFooter className="flex flex-col items-stretch gap-4 px-8 pb-8">
							<Button 
								type="submit" 
								disabled={loading}
								className="h-12 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
							>
								{loading ? (
									<div className="flex items-center gap-2">
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
										Signing in...
									</div>
								) : (
									<div className="flex items-center gap-2">
										Sign In
										<ArrowRight className="h-4 w-4" />
									</div>
								)}
							</Button>
							
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-border"></div>
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-white px-2 text-muted-foreground">New to KMRL DMS?</span>
								</div>
							</div>
							
							<Link 
								to="/signup" 
								className="text-center p-3 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-lg transition-all duration-300 font-medium"
							>
								Create New Account
							</Link>
						</CardFooter>
					</form>
				</Card>

				{/* Footer */}
				<div className="text-center mt-8">
					<p className="text-xs text-muted-foreground">
						© 2024 Kochi Metro Rail Limited. All rights reserved.
					</p>
				</div>
			</div>
		</div>
	);
};

export default Login;