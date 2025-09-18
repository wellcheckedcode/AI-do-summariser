import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import DocumentSummaryCard from "@/components/DocumentSummaryCard";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getViewUrl } from "@/lib/storage";

import { LayoutDashboard, FolderKanban, UploadCloud, ArrowLeft, Loader2, ServerCrash, Inbox, Paperclip, Inbox as InboxIcon, Image as ImageIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import BackButton from "@/components/BackButton";
import PageShell from "@/components/PageShell";

const ActionCard = ({ icon, title, description, buttonText, onClick, index }) => {
    return (
        <Card
            style={{ animationDelay: `${index * 100}ms` }}
            className="w-full max-w-sm text-center Opacity-1 animate-fadeInUp transition-all duration-300 ease-in-out hover:shadow-hover hover:-translate-y-1.5 shadow-card gradient-card"
        >
            <CardHeader className="items-center">
                <div className="p-4 bg-primary/10 rounded-full mb-2">
                    {icon}
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={onClick} size="lg" className="w-full">
                    {buttonText}
                </Button>
            </CardContent>
        </Card>
    );
};


const Dashboard = () => {
    const { user, department } = useAuth();
    const navigate = useNavigate();

    const [showDocuments, setShowDocuments] = useState(true);
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const priorityOrder = { "High": 1, "Medium": 2, "Low": 3 };

const sortDocumentsByPriority = (docs) => {
  return docs.sort((a, b) => {
    const priorityA = priorityOrder[a.priority] || 4;
    const priorityB = priorityOrder[b.priority] || 4;
    return priorityA - priorityB;
  });
};

    // View a document via public or signed URL
    const onView = async (path) => {
        try {
            const url = await getViewUrl(path);
            const win = window.open(url, "_blank", "noopener,noreferrer");
            if (win) win.opener = null;
        } catch (e) {
            setError(e?.message || "Failed to open document.");
        }
    };

    useEffect(() => {
        let alive = true;

        const fetchDocuments = async () => {
            if (!user || !department || !showDocuments) {
                setLoading(false);
                return;
            }
            
            setLoading(true);
            setError("");
            
            try {
                const { supabase } = await import("@/integrations/supabase/client");
                
                const { data, error } = await supabase
                    .from("documents")
                    .select("id, name, ai_summary, created_at, department, path, priority, action_required")
                    .eq("department", department)
                    .order("created_at", { ascending: false })
                    .limit(50);
                
                if (error) throw error;
                if (!alive) return;
                
                const transformedDocs = (data || []).map(doc => ({
                    id: doc.id,
                    title: doc.name,
                    summary: doc.ai_summary || "No summary available",
                    updatedAt: new Date(doc.created_at).toLocaleDateString(),
                    department: doc.department,
                    path: doc.path,
                    priority: doc.priority || "Medium", // <-- Add priority
                    action_required: doc.action_required || "Review" //
                }));
                
               setDocs(sortDocumentsByPriority(transformedDocs));
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
    }, [user, department, showDocuments]);

    const handleViewDocumentsClick = () => {
        setShowDocuments(true);
    };

    const handleBackClick = () => {
        setShowDocuments(false);
        setDocs([]);
    };

    const handleUploadClick = () => {
        navigate('/get-started');
    };

    const UploadMenu = ({ onUploadClick }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="sm" className="inline-flex items-center gap-2">
                    <Paperclip className="h-4 w-4" /> Upload
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onUploadClick(); }}>
                    <ImageIcon className="h-4 w-4 mr-2" /> Upload from device
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); navigate('/get-started'); }}>
                    <InboxIcon className="h-4 w-4 mr-2" /> Import from Gmail
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const renderDashboardContent = () => {
        // Always show documents by default

        return (
            <div className="space-y-6 Opacity-1 animate-fadeInUp">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-muted-foreground">Recent {department} files</div>
                    {/* Upload menu */}
                    <div className="relative">
                        <UploadMenu onUploadClick={handleUploadClick} />
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center items-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="ml-2 text-muted-foreground">Loading documents...</p>
                    </div>
                )}
                {error && (
                     <div className="p-12 text-center rounded-lg border border-destructive/50 bg-destructive/10">
                        <ServerCrash className="h-12 w-12 text-destructive mx-auto" />
                        <h3 className="mt-2 text-lg font-semibold text-destructive">Failed to Load Documents</h3>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                )}
                {!loading && !error && docs.length === 0 && (
                     <div className="p-12 text-center rounded-lg border-2 border-dashed">
                        <Inbox className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                        <h3 className="mt-2 text-lg font-semibold">No Documents Found</h3>
                        <p className="text-sm text-muted-foreground">There are no documents available for the {department} department yet.</p>
                    </div>
                )}
                
                {!loading && !error && docs.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {docs.map((d, index) => (
                            <DocumentSummaryCard
                                key={d.id}
                                title={d.title}
                                summary={d.summary}
                                updatedAt={d.updatedAt}
                                priority={d.priority}
                                action_required={d.action_required}
                                onOpen={() => onView(d.path)}
                                style={{ animationDelay: `${index * 75}ms` }}
                                className="Opacity-1 animate-fadeInUp"
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <PageShell
            title="Dashboard"
            subtitle={`Welcome, ${user?.user_metadata?.full_name || user?.email}`}
            icon={<LayoutDashboard className="h-6 w-6 text-primary" />}
        >
            <BackButton />
            
            {renderDashboardContent()}
        </PageShell>
    );
};

export default Dashboard;