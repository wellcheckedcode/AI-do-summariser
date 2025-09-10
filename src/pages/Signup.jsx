import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const departments = [
	"HR",
	"IT",
	"Finance",
	"Operations",
	"Legal",
];

const Signup = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [department, setDepartment] = useState("");
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);

	if (user) return <Navigate to="/dashboard" replace />;

	const onSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setMessage("");
		setLoading(true);
		const { data, error: signError } = await (await import("@/integrations/supabase/client")).supabase.auth.signUp({
			email,
			password,
			options: {
				data: { department },
			},
		});
		setLoading(false);
		if (signError) {
			setError(signError.message);
			return;
		}
		// If email confirmations are enabled, session may be null until confirm
		if (!data.session) {
			setMessage("Check your email to confirm your account, then log in.");
			return;
		}
		navigate("/dashboard", { replace: true });
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>Create account</CardTitle>
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
						<div className="space-y-2">
							<Label>Department</Label>
							<Select value={department} onValueChange={setDepartment}>
								<SelectTrigger>
									<SelectValue placeholder="Select department" />
								</SelectTrigger>
								<SelectContent>
									{departments.map((d) => (
										<SelectItem key={d} value={d}>{d}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						{error ? <p className="text-sm text-red-600">{error}</p> : null}
						{message ? <p className="text-sm text-green-600">{message}</p> : null}
					</CardContent>
					<CardFooter className="flex flex-col items-stretch gap-2">
						<Button type="submit" disabled={loading || !department}>{loading ? "Creating..." : "Create account"}</Button>
						<p className="text-sm text-muted-foreground text-center">
							Already have an account? <Link to="/login" className="underline">Sign in</Link>
						</p>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
};

export default Signup;


