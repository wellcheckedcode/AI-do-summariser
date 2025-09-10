import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getViewUrl, STORAGE_BUCKET } from "@/lib/storage";
import { apiService } from "@/lib/api";

const Documents = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summarizing, setSummarizing] = useState({}); // id -> boolean
  const [activeSummary, setActiveSummary] = useState(null); // { title, summary }

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
          .select("id,name,path,mime_type,size_bytes,created_at,ai_summary,department")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(100);
        if (error) throw error;

        // Reconcile with Storage: hide DB rows whose objects were deleted in Storage
        const { data: storageList, error: listErr } = await supabase
          .storage
          .from(STORAGE_BUCKET)
          .list(user.id, { limit: 1000 });
        if (listErr) {
          // If we cannot list (e.g., private bucket without policy), fall back to showing DB rows as-is
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
        setError(err.message || "Failed to load");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };
    run();
    return () => { alive = false; };
  }, [user]);

  const onView = async (path) => {
    try {
      const url = await getViewUrl(path);
      window.open(url, "_blank");
    } catch (e) {
      setError(e?.message || "Failed to open document");
    }
  };

  const sanitizeSummary = (raw) => {
    if (!raw) return "";
    let text = String(raw).trim();
    // Strip typical code fences
    text = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    // Try parse JSON objects containing summary
    const tryParse = (s) => {
      try { return JSON.parse(s); } catch { return null; }
    };
    let parsed = tryParse(text) || tryParse(text.replace(/^'/, '"').replace(/'$/, '"'));
    if (parsed && typeof parsed === 'object') {
      if (parsed.summary && typeof parsed.summary === 'string') {
        text = parsed.summary;
      } else if (Array.isArray(parsed)) {
        const found = parsed.find((x) => x && typeof x.summary === 'string');
        if (found) text = found.summary;
      }
    }
    // Remove enclosing quotes
    if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
      text = text.slice(1, -1);
    }
    // Remove leading keys like "summary:" or similar remnants
    text = text.replace(/^\s*summary\s*[:=]\s*/i, "");
    // Replace escaped quotes
    text = text.replace(/\\"/g, '"').replace(/\\n/g, '\n');
    return text.trim();
  };

  const blobToDataUrl = async (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });

  const onSummarize = async (item) => {
    const rowId = item.id ?? item.path;
    setError("");
    setSummarizing((m) => ({ ...m, [rowId]: true }));
    try {
      const viewUrl = await getViewUrl(item.path);
      const res = await fetch(viewUrl);
      if (!res.ok) throw new Error("Failed to download document");
      const blob = await res.blob();
      const dataUrl = await blobToDataUrl(blob);

      const analysis = await apiService.analyzeDocument(dataUrl, item.name);
      const aiSummary = sanitizeSummary(analysis?.summary || analysis?.text || "No summary generated.");

      // Persist back to Supabase
      const { supabase } = await import("@/integrations/supabase/client");
      if (item.id) {
        await supabase.from("documents").update({ ai_summary: aiSummary }).eq("id", item.id);
      }

      // Update local state
      setItems((prev) => prev.map((it) => it.path === item.path ? { ...it, ai_summary: aiSummary } : it));
      setActiveSummary({ title: item.name, summary: aiSummary });
    } catch (e) {
      setError(e?.message || "Failed to summarize");
    } finally {
      setSummarizing((m) => ({ ...m, [rowId]: false }));
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Documents</h2>
          <p className="text-sm text-muted-foreground mt-2">Your uploaded files</p>
        </div>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.length === 0 && !loading ? (
          <p className="text-sm text-muted-foreground">No documents yet. Upload some from Get Started.</p>
        ) : (
          items.map((it) => {
            const rowId = it.id ?? it.path;
            const busy = !!summarizing[rowId];
            return (
              <Card key={rowId} className="h-full shadow-card">
                <CardHeader className="pb-3 space-y-1">
                  <CardTitle className="text-base leading-snug truncate">{it.name}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {it.department && (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">{it.department}</span>
                    )}
                    <span className="text-muted-foreground">{new Date(it.created_at).toLocaleString()}</span>
                  </div>
                  {/* Hide inline summary per request; shown in popup only */}
                </CardHeader>
                <CardContent className="flex items-center justify-end gap-2">
                  <Button size="sm" variant="secondary" onClick={() => onView(it.path)}>View</Button>
                  <Button size="sm" variant="secondary" onClick={() => onSummarize(it)} disabled={busy}>
                    {busy ? "Summarizing..." : (it.ai_summary ? "Re-summarize" : "Summarize")}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={!!activeSummary} onOpenChange={(open) => !open && setActiveSummary(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Summary</DialogTitle>
          </DialogHeader>
          {activeSummary && (
            <div className="space-y-2">
              <div className="text-sm font-medium break-words">{activeSummary.title}</div>
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



