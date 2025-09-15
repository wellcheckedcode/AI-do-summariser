import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [session, setSession] = useState(null);
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;
		const init = async () => {
			const { data } = await supabase.auth.getSession();
			if (!isMounted) return;
			setSession(data.session ?? null);
			setUser(data.session?.user ?? null);
			setLoading(false);
		};
		init();

		const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
			setSession(newSession);
			setUser(newSession?.user ?? null);
		});

		return () => {
			isMounted = false;
			authListener.subscription.unsubscribe();
		};
	}, []);

	const value = useMemo(() => ({
		user,
		session,
		loading,
		department: user?.app_metadata?.department || user?.user_metadata?.department || null,
		login: async (email, password) => {
			return supabase.auth.signInWithPassword({ email, password });
		},
		logout: async () => {
			await supabase.auth.signOut();
		}
	}), [user, session, loading]);

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
};

export const useRequireDepartment = (allowedDepartments) => {
	const { department } = useAuth();
	if (!allowedDepartments) return true;
	if (!Array.isArray(allowedDepartments)) allowedDepartments = [allowedDepartments];
	return department ? allowedDepartments.includes(department) : false;
};


