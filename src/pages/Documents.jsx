import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { getViewUrl, STORAGE_BUCKET } from "@/lib/storage";
import { apiService } from "@/lib/api";
import {
  FileText, Eye, Bot, Loader2, ServerCrash, Inbox, FileCode, FileImage, FileAudio,
  FileVideo, Briefcase, CalendarDays, Scale
} from "lucide-react";

// Helper functions and UI State Components remain the same from the previous version.
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


const Documents = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summarizing, setSummarizing] = useState({});
  const [activeSummary, setActiveSummary] = useState(null);
  const [updatingRead, setUpdatingRead] = useState({});

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
          .select("id,name,path,mime_type,size_bytes,created_at,ai_summary,department,is_read")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;

        const { data: storageList, error: listErr } = await supabase
          .storage
          .from(STORAGE_BUCKET)
          .list(user.id, { limit: 1000 });
        if (listErr) {
          if (!alive) return;
          setItems(data || []);
          return;
        }

        const existingPaths = new Set((storageList || []).map((o) => `${user.id}/${o.name}`));
        const filtered = (data || []).filter((row) => existingPaths.has(row.path));
        if (!alive) return;
        setItems(filtered);

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

  const onToggleReadStatus = async (item) => {
    const rowId = item.id;
    const originalStatus = item.is_read;
    setUpdatingRead(prev => ({...prev, [rowId]: true}));
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
      setUpdatingRead(prev => ({...prev, [rowId]: false}));
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

  // Other functions like onView, blobToDataUrl, onSummarize remain the same
  const onView = async (path) => { /* ... */ };
  const blobToDataUrl = async (blob) => { /* ... */ };
  const onSummarize = async (item) => { /* ... */ };

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
                <CardTitle className="text-base leading-snug truncate" title={it.name}>{it.name}</CardTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>{new Date(it.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm pb-4">
              <div className="space-y-2">
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

              {/* --- NEW: In-card AI Summary Snippet --- */}
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
       <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Documents</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">View, manage, and analyze your uploaded files.</p>
        </div>
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
              <div className="text-sm font-bold break-words border-b pb-2">
                File: {activeSummary.title}
              </div>
              <div className="text-base leading-relaxed text-foreground whitespace-pre-wrap break-words">
                {sanitizeSummary(activeSummary.summary)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Documents;