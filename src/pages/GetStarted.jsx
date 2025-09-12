import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiService, fileToBase64 } from "@/lib/api";
import { UploadCloud, Loader2 } from "lucide-react";

const GetStarted = () => {
  const { user, department } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileSelectAndUpload = async () => {
    // Create a hidden file input
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
      } catch (err) {
        setMessage(err.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    };
    
    input.click();
  };

  
  return (
    <div className="min-h-1 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 height-100vh">
      <Card className="w-96 h-96 mx-auto bg-blue-100 shadow-xl border ...">
        <CardHeader className="text-center pt-8 pb-4">
          <CardTitle className="text-1x5 text-gray-800">
            Get Started
          </CardTitle>
          <p className="text-sm text-gray-500 pt-1">
            Upload documents to begin processing.
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8 flex-1 flex flex-col items-center justify-center text-center gap-6">
          {/* Main Icon */}
          <div className="w-30 h-30 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <UploadCloud className="w-15 h-20 text-blue-500" strokeWidth={2.5} />
          </div>

          <p className="text-sm text-gray-600 leading-relaxed gap-2">
            You can select multiple files. Click the button below to browse files from your device.
          </p>
          
          <div className="w-full flex flex-col items-center gap-2">
            <Button 
              onClick={handleFileSelectAndUpload} 
              disabled={uploading}
              className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-white-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-blue-500/30 text-base"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Choose & Upload Documents"
              )}
            </Button>
            
            <p className="text-xs text-gray-500 h-4 mt-1">
              {uploading ? "Please wait while we process your files..." : "Max file size: 50MB"}
            </p>
          </div>

          {message && (
            <div className={`p-2 rounded-lg text-xs text-center ${
              message.includes('successfully') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GetStarted;
