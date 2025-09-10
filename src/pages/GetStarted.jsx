import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiService, fileToBase64 } from "@/lib/api";

const GetStarted = () => {
  const { user, department } = useAuth();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const onSelect = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const onUpload = async () => {
    if (!user || files.length === 0) return;
    setUploading(true);
    setMessage("");
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { STORAGE_BUCKET } = await import("@/lib/storage");
      
      for (const f of files) {
        // Convert file to base64 for AI analysis
        const fileData = await fileToBase64(f);
        
        // Analyze document with AI to get summary and department
        let aiSummary = "";
        let detectedDepartment = department || "Unknown";
        
        try {
          const analysis = await apiService.analyzeDocument(fileData, f.name);
          aiSummary = analysis.summary || "";
          detectedDepartment = analysis.department || department || "Unknown";
        } catch (aiError) {
          console.warn("AI analysis failed, using fallback:", aiError);
          aiSummary = `Document: ${f.name}`;
        }
        
        const path = `${user.id}/${Date.now()}-${f.name}`;
        const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, f, { upsert: false });
        if (error) throw error;
        
        // Store metadata in Supabase table with AI analysis
        const { error: dbError } = await supabase.from("documents").insert({
          user_id: user.id,
          department: detectedDepartment,
          name: f.name,
          path,
          mime_type: f.type || null,
          size_bytes: f.size ?? null,
          ai_summary: aiSummary,
          created_at: new Date().toISOString()
        });
        if (dbError) throw dbError;
      }
      setMessage(`Uploaded successfully! Documents analyzed and assigned to departments. Find them in the Dashboard.`);
      setFiles([]);
    } catch (err) {
      setMessage(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Select documents from your device to upload and view later in the Documents page.</p>
          <input type="file" multiple onChange={onSelect} />
          <div className="flex gap-2">
            <Button onClick={onUpload} disabled={uploading || files.length === 0}>{uploading ? "Uploading..." : "Upload"}</Button>
            <span className="text-sm text-muted-foreground">{files.length ? `${files.length} file(s) selected` : null}</span>
          </div>
          {message ? <p className="text-sm">{message}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default GetStarted;



