import { useState } from "react";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>Login</CardTitle>
				</CardHeader>
				<form onSubmit={onSubmit}>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
						</div>
						{error ? <p className="text-sm text-red-600">{error}</p> : null}
					</CardContent>
					<CardFooter className="flex flex-col items-stretch gap-2">
						<Button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
						<p className="text-sm text-muted-foreground text-center">
							New here? <Link to="/signup" className="underline">Create an account</Link>
						</p>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
};

export default Login;


