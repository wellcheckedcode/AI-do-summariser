import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { apiService, fileToBase64 } from "@/lib/api";
import { UploadCloud, Loader2, Inbox } from "lucide-react";
import BackButton from "@/components/BackButton";

const GetStarted = () => {
  const { user, department } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [gmailImporting, setGmailImporting] = useState(false);
  const [message, setMessage] = useState("");
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleFileSelectAndUpload = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '*/*';
    
    input.onchange = async (e) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (selectedFiles.length === 0) return;
      
      setUploading(true);
      setMessage("");
      
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { STORAGE_BUCKET } = await import("@/lib/storage");
        
        for (const f of selectedFiles) {
          const fileData = await fileToBase64(f);
          
          let aiSummary = "";
          let detectedDepartment = department || "Unknown";
          let detectedPriority = "Medium";
          let actionRequired = "Review required";
          
          try {
            const analysis = await apiService.analyzeDocument(fileData, f.name);
            aiSummary = analysis.summary || "";
            detectedDepartment = analysis.department || department || "Unknown";
            detectedPriority = analysis.priority || "Medium";
            actionRequired = analysis.action_required || "Review required";
          } catch (aiError) {
            console.warn("AI analysis failed, using fallback:", aiError);
            aiSummary = `Document: ${f.name}`;
          }
          
          const path = `${user.id}/${Date.now()}-${f.name}`;
          const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, f, { upsert: false });
          if (error) throw error;
          
          const { error: dbError } = await supabase.from("documents").insert({
            user_id: user.id,
            department: detectedDepartment,
            name: f.name,
            path,
            mime_type: f.type || null,
            size_bytes: f.size ?? null,
            ai_summary: aiSummary,
            priority: detectedPriority,
            action_required: actionRequired,
            created_at: new Date().toISOString()
          });
          if (dbError) throw dbError;
        }
        setMessage(`Uploaded successfully! Documents analyzed and assigned to departments. Find them in the Dashboard.`);
      } catch (err) {
        setMessage(err.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    };
    
    input.click();
  };

  const handleGmailImport = async () => {
    try {
      setGmailImporting(true);
      setMessage("");
      if (!user) {
        setShowAuthDialog(true);
        return;
      }

      const { auth_url, state } = await apiService.getGmailAuthUrl(user.id);

      const w = 600, h = 700;
      const left = window.screenX + (window.outerWidth - w) / 2;
      const top = window.screenY + (window.outerHeight - h) / 2;
      const popup = window.open(auth_url, "gmail_oauth", `width=${w},height=${h},left=${left},top=${top}`);

      await new Promise((resolve, reject) => {
        const timer = setInterval(async () => {
          if (!popup || popup.closed) {
            clearInterval(timer);
            resolve();
          }
        }, 700);
        setTimeout(() => { try { clearInterval(timer); } catch {} resolve(); }, 120000);
      });

      const importRes = await apiService.importFromGmail(state, {
        query: 'is:unread has:attachment newer_than:30d',
        maxResults: 50
      });
      console.log(importRes);
      setMessage(`Gmail import successful! Imported ${importRes.imported || 0} documents from unread emails. Find them in the Dashboard.`);
    } catch (e) {
      setMessage(e?.message || "Gmail import failed.");
    } finally {
      setGmailImporting(false);
    }
  };

  
  return (
    <div className="min-h-1 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 height-100vh">
      <div className="fixed top-4 left-4">
        <BackButton className="" />
      </div>
      <Card className="w-96 h-auto mx-auto bg-blue-100 shadow-xl border ...">
        <CardHeader className="text-center pt-8 pb-4">
          <CardTitle className="text-1x5 text-gray-800">
            Get Started
          </CardTitle>
          <p className="text-sm text-gray-500 pt-1">
            Upload documents to begin processing.
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8 flex-1 flex flex-col items-center justify-center text-center gap-6 min-h-[300px]">
          <div className="w-30 h-30 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <UploadCloud className="w-15 h-20 text-blue-500" strokeWidth={2.5} />
          </div>

          <p className="text-sm text-gray-600 leading-relaxed gap-2">
            Choose how you'd like to add documents. Upload files from your device or import attachments from Gmail.
          </p>
          
          <div className="w-full flex flex-col items-center gap-3">
            <div className="w-full flex gap-2">
              <Button 
                onClick={handleFileSelectAndUpload} 
                disabled={uploading || gmailImporting}
                className="flex-1 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-blue-500/30 text-sm"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Choose & Upload
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleGmailImport} 
                disabled={uploading || gmailImporting || !user}
                className="flex-1 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-green-500/30 text-sm"
              >
                {gmailImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Inbox className="mr-2 h-4 w-4" />
                    Import from Gmail
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 h-4 mt-1 text-center">
              {uploading ? "Please wait while we process your files..." : 
               gmailImporting ? "Please wait while we import from Gmail..." :
               "Max file size: 50MB • Gmail imports recent attachments"}
            </p>
          </div>

          {message && (
            <div className={`p-2 rounded-lg text-xs text-center ${
              message.includes('successfully') || message.includes('successful')
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in required</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            Please sign in to upload documents or import from Gmail.
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAuthDialog(false)}>Cancel</Button>
            <Button onClick={() => navigate('/login')}>Sign in</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GetStarted;