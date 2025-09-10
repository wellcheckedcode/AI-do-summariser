import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import DocumentSummaryCard from "@/components/DocumentSummaryCard";

const Dashboard = () => {
	const { user, department } = useAuth();
	const [docs, setDocs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let alive = true;
		const fetchDocuments = async () => {
			if (!user || !department) return;
			
			setLoading(true);
			setError("");
			
			try {
				const { supabase } = await import("@/integrations/supabase/client");
				
				// Fetch documents for the user's department
				const { data, error } = await supabase
					.from("documents")
					.select("id, name, ai_summary, created_at, department")
					.eq("department", department)
					.order("created_at", { ascending: false })
					.limit(50);
				
				if (error) throw error;
				
				if (!alive) return;
				
				// Transform data to match DocumentSummaryCard props
				const transformedDocs = (data || []).map(doc => ({
					id: doc.id,
					title: doc.name,
					summary: doc.ai_summary || "No summary available",
					updatedAt: new Date(doc.created_at).toLocaleDateString(),
					department: doc.department
				}));
				
				setDocs(transformedDocs);
			} catch (err) {
				if (!alive) return;
				setError(err.message || "Failed to load documents");
			} finally {
				if (!alive) return;
				setLoading(false);
			}
		};
		
		fetchDocuments();
		return () => { alive = false; };
	}, [user, department]);

	return (
		<div className="p-6 space-y-6">
			<div>
				<h2 className="text-2xl font-semibold">Dashboard</h2>
				<p className="text-sm text-muted-foreground mt-2">Welcome {user?.email}</p>
				<p className="mt-2">Department: {department || "Unknown"}</p>
			</div>

			{loading && <p className="text-sm text-muted-foreground">Loading documents...</p>}
			{error && <p className="text-sm text-red-600">{error}</p>}

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{docs.length === 0 && !loading ? (
					<p className="text-sm text-muted-foreground">No documents found for this department.</p>
				) : (
					docs.map((d) => (
						<DocumentSummaryCard
							key={d.id}
							title={d.title}
							summary={d.summary}
							updatedAt={d.updatedAt}
							onOpen={() => {}}
						/>
					))
				)}
			</div>
		</div>
	);
};

export default Dashboard;


