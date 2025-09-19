import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { getViewUrl } from "@/lib/storage";
import { apiService } from "@/lib/api";
import BackButton from "@/components/BackButton";
import PageShell from "@/components/PageShell";
import {
    FileText, Eye, Bot, Loader2, ServerCrash, Inbox, FileCode, FileImage, FileAudio,
    FileVideo, Briefcase, CalendarDays, Scale, Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Helper functions and UI State Components remain the same from the previous version.
const priorityOrder = { "High": 1, "Medium": 2, "Low": 3 };

const sortDocumentsByPriority = (docs) => {
    return docs.sort((a, b) => {
        const priorityA = priorityOrder[a.priority] || 4;
        const priorityB = priorityOrder[b.priority] || 4;
        return priorityA - priorityB;
    });
};
const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const getFileIcon = (mimeType = "") => {
    const iconProps = { className: "h-10 w-10 text-primary" };
    if (mimeType.startsWith("image/")) return <FileImage {...iconProps} />;
    if (mimeType.startsWith("application/pdf")) return <FileText {...iconProps} />;
    if (mimeType.startsWith("text/")) return <FileCode {...iconProps} />;
    if (mimeType.startsWith("audio/")) return <FileAudio {...iconProps} />;
    if (mimeType.startsWith("video/")) return <FileVideo {...iconProps} />;
    return <FileText {...iconProps} />;
};

const DocumentCardSkeleton = () => (
    <Card className="flex flex-col justify-between">
        <div>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-1/3" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
            </CardContent>
        </div>
        <CardFooter className="flex justify-between gap-2">
            <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-9 w-20 rounded-md" />
                <Skeleton className="h-9 w-28 rounded-md" />
            </div>
        </CardFooter>
    </Card>
);

const EmptyState = () => (
    <div className="col-span-1 sm:col-span-2 lg:col-span-3 mt-8 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
        <Inbox className="h-16 w-16 text-muted-foreground/50" />
        <h3 className="mt-4 text-xl font-semibold">No Documents Found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
            You haven't uploaded any documents yet. Get started by uploading a file.
        </p>
    </div>
);

const ErrorState = ({ message }) => (
    <div className="col-span-1 sm:col-span-2 lg:col-span-3 mt-8 flex flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-12 text-center">
        <ServerCrash className="h-16 w-16 text-destructive" />
        <h3 className="mt-4 text-xl font-semibold text-destructive">An Error Occurred</h3>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
);


const ImportFromGmail = ({ user, onImported }) => {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const handleImport = async () => {
        try {
            setBusy(true);
            setError("");
            if (!user) throw new Error("You must be logged in.");

            // 1) Get OAuth URL
            const { auth_url, state } = await apiService.getGmailAuthUrl(user.id);

            // 2) Open popup for Google OAuth
            const w = 600, h = 700;
            const left = window.screenX + (window.outerWidth - w) / 2;
            const top = window.screenY + (window.outerHeight - h) / 2;
            const popup = window.open(auth_url, "gmail_oauth", `width=${w},height=${h},left=${left},top=${top}`);

            // 3) Poll until popup is closed (after callback closes it)
            await new Promise((resolve, reject) => {
                const timer = setInterval(async () => {
                    if (!popup || popup.closed) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 700);
                setTimeout(() => { try { clearInterval(timer); } catch { } resolve(); }, 120000); // safety timeout
            });

            // 4) The backend stored credentials under a state key; we can't read that from here.
            // For simplicity in this demo, we'll import using the last state created for this user.
            // In production, you should persist a mapping of user->state server-side.
            // 4) Tell backend to import attachments with the known OAuth state - focus on unread messages
            const importRes = await apiService.importFromGmail(state, {
                query: 'is:unread has:attachment newer_than:30d',
                maxResults: 50
            });
            console.log(importRes);
            onImported?.();
        } catch (e) {
            setError(e?.message || "Gmail import failed.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={handleImport} disabled={busy || !user}>
                {busy ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<Inbox className="mr-2 h-4 w-4" />)}
                {busy ? "Importing..." : "Import from Gmail"}
            </Button>
            {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
    );
};

const Documents = () => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [summarizing, setSummarizing] = useState({});
    const [activeSummary, setActiveSummary] = useState(null);
    const [updatingRead, setUpdatingRead] = useState({});
    const [deleting, setDeleting] = useState(null);


    useEffect(() => {
        let alive = true;
        const run = async () => {
            if (!user) return;
            setLoading(true);
            setError("");
            try {
                const { supabase } = await import("@/integrations/supabase/client");
                const { data, error } = await supabase
                    .from("documents")
                    .select("id,name,path,mime_type,size_bytes,created_at,ai_summary,department,is_read,priority,action_required")
                    .order("created_at", { ascending: false });
                if (error) throw error;
                if (!alive) return;
                setItems(sortDocumentsByPriority(data || []));

            } catch (err) {
                if (!alive) return;
                setError(err.message || "Failed to load documents.");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        };
        run();
        return () => { alive = false; };
    }, [user]);

    const onDelete = async (item) => {
        setDeleting(item.id);
        try {
            const { supabase } = await import("@/integrations/supabase/client");
            // First, delete the file from storage
            const { error: storageError } = await supabase.storage.from('documents').remove([item.path]);
            if (storageError) {
                throw storageError;
            }
            // Then, delete the record from the database
            const { error: dbError } = await supabase.from('documents').delete().eq('id', item.id);
            if (dbError) {
                throw dbError;
            }
            setItems(items.filter((i) => i.id !== item.id));
        } catch (e) {
            setError(e?.message || "Failed to delete document.");
        } finally {
            setDeleting(null);
        }
    };


    const onToggleReadStatus = async (item) => {
        const rowId = item.id;
        const originalStatus = item.is_read;
        setUpdatingRead(prev => ({ ...prev, [rowId]: true }));
        setItems(prevItems =>
            prevItems.map(it =>
                it.id === rowId ? { ...it, is_read: !it.is_read } : it
            )
        );

        try {
            const { supabase } = await import("@/integrations/supabase/client");
            const { error } = await supabase
                .from("documents")
                .update({ is_read: !originalStatus })
                .eq("id", rowId);
            if (error) throw error;
        } catch (e) {
            setError(e?.message || "Failed to update status.");
            setItems(prevItems =>
                prevItems.map(it =>
                    it.id === rowId ? { ...it, is_read: originalStatus } : it
                )
            );
        } finally {
            setUpdatingRead(prev => ({ ...prev, [rowId]: false }));
        }
    };

    const sanitizeSummary = (raw) => {
        if (!raw) return "";
        let text = String(raw).trim();
        text = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
        const tryParse = (s) => { try { return JSON.parse(s); } catch { return null; } };
        let parsed = tryParse(text) || tryParse(text.replace(/^'/, '"').replace(/'$/, '"'));
        if (parsed && typeof parsed === 'object') {
            if (parsed.summary && typeof parsed.summary === 'string') text = parsed.summary;
            else if (Array.isArray(parsed)) {
                const found = parsed.find((x) => x && typeof x.summary === 'string');
                if (found) text = found.summary;
            }
        }
        if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) text = text.slice(1, -1);
        text = text.replace(/^\s*summary\s*[:=]\s*/i, "");
        text = text.replace(/\\"/g, '"').replace(/\\n/g, '\n');
        return text.trim();
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

    // Convert Blob to DataURL (base64) string
    const blobToDataUrl = async (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    // Generate or refresh AI summary for a document
    const onSummarize = async (item) => {
        const rowId = item.id ?? item.path;
        setSummarizing((prev) => ({ ...prev, [rowId]: true }));
        setError("");

        try {
            // 1) Get a viewable URL for the file from storage
            const url = await getViewUrl(item.path);

            // 2) Fetch the file as Blob
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to download file for analysis.");
            const blob = await res.blob();

            // 3) Convert to base64 data URL
            const dataUrl = await blobToDataUrl(blob);

            // 4) Call backend to analyze
            const result = await apiService.analyzeDocument(dataUrl, item.name || "document");

            const newSummary = result?.summary || "";
            const newDepartment = result?.department || item.department || null;

            // 5) Persist to Supabase
            const { supabase } = await import("@/integrations/supabase/client");
            const { error: upErr } = await supabase
                .from("documents")
                .update({ ai_summary: newSummary, department: newDepartment })
                .eq("id", item.id);
            if (upErr) throw upErr;

            // 6) Update UI state
            setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, ai_summary: newSummary, department: newDepartment } : it)));

            // 7) Show dialog with the latest summary
            setActiveSummary({ title: item.name, summary: newSummary });
        } catch (e) {
            setError(e?.message || "Failed to summarize document.");
        } finally {
            setSummarizing((prev) => ({ ...prev, [rowId]: false }));
        }
    };

    const renderContent = () => {
        if (loading) {
            return Array.from({ length: 6 }).map((_, i) => <DocumentCardSkeleton key={i} />);
        }
        if (error) {
            return <ErrorState message={error} />;
        }
        if (items.length === 0) {
            return <EmptyState />;
        }
        return items.map((it) => {
            const rowId = it.id ?? it.path;
            const busy = !!summarizing[rowId];
            const isUpdatingRead = !!updatingRead[rowId];

            const getPriorityVariant = () => {
                if (it.priority === 'High') return 'destructive';
                if (it.priority === 'Medium') return 'secondary';
                return 'outline';
            };

            return (
                <Card
                    key={rowId}
                    className={cn(
                        "flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1",
                        it.is_read && "bg-slate-50 opacity-70"
                    )}
                >
                    <div>
                        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                            {getFileIcon(it.mime_type)}
                            <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-base leading-snug truncate" title={it.name}>{it.name}</CardTitle>
                                    <div className="flex items-center gap-1">
                                        <Badge variant={getPriorityVariant()}>{it.priority || 'Medium'}</Badge>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" disabled={deleting === it.id}>
                                                    {deleting === it.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the
                                                        document and remove its data from our servers.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => onDelete(it)}>
                                                        Continue
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1.5">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    <span>{new Date(it.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm pb-4">
                            <div className="space-y-2">
                                {/* --- ADDED ACTION REQUIRED TEXT --- */}
                                {it.action_required && (
                                    <div className="flex items-center gap-2 font-semibold text-xs text-foreground mb-1">
                                        <span>Action: {it.action_required}</span>
                                    </div>
                                )}
                                {it.department && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Briefcase className="h-4 w-4 flex-shrink-0" />
                                        <span className="truncate">{it.department}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Scale className="h-4 w-4 flex-shrink-0" />
                                    <span>{formatBytes(it.size_bytes)}</span>
                                </div>
                            </div>

                            {it.ai_summary && (
                                <div className="pt-3 border-t">
                                    <div className="flex items-center gap-2 font-semibold text-xs text-foreground mb-1">
                                        <Bot className="h-4 w-4 flex-shrink-0" />
                                        <span>AI Summary</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-3" title={sanitizeSummary(it.ai_summary)}>
                                        {sanitizeSummary(it.ai_summary)}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </div>

                    <CardFooter className="flex items-center justify-between pt-4 bg-slate-50/50 border-t">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id={`read-${rowId}`}
                                checked={it.is_read}
                                onCheckedChange={() => onToggleReadStatus(it)}
                                disabled={isUpdatingRead}
                            />
                            <Label
                                htmlFor={`read-${rowId}`}
                                className="text-sm font-medium leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Read
                            </Label>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => onView(it.path)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                            </Button>
                            <Button size="sm" variant="default" onClick={() => onSummarize(it)} disabled={busy} className="min-w-[120px]">
                                {busy ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<Bot className="mr-2 h-4 w-4" />)}
                                {busy ? "Analyzing..." : (it.ai_summary ? "Re-summarize" : "Summarize")}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            );
        });
    };

    return (
        <PageShell
            title="All Documents"
            subtitle="View, manage, and analyze files uploaded by any member."
            icon={<FileText className="h-6 w-6 text-primary" />}
        >
            <BackButton />

            <div className="flex items-center justify-between gap-3 pb-1">
                <div />
                <ImportFromGmail user={user} onImported={() => window.location.reload()} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {renderContent()}
            </div>

            <Dialog open={!!activeSummary} onOpenChange={(open) => !open && setActiveSummary(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            AI Summary
                        </DialogTitle>
                    </DialogHeader>
                    {activeSummary && (
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            <div className="text-sm font-medium break-words border-b pb-2">
                                File: {activeSummary.title}
                            </div>
                            <div className="text-base leading-relaxed text-foreground whitespace-pre-wrap break-words">
                                {sanitizeSummary(activeSummary.summary)}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </PageShell>
    );
};

export default Documents;