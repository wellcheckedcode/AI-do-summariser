import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Paperclip, Send, Inbox, Image as ImageIcon, UploadCloud, Users, Cpu, Scale, Cog, Banknote } from "lucide-react"; // Icons for sources and departments
import { useAuth } from "@/hooks/use-auth"; 
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { apiService, fileToBase64 } from "@/lib/api";

//=================================================================
// 1. HEADER COMPONENT (MODIFIED)
//=================================================================
const Header = () => {
  const { user, logout } = useAuth();

  return (
    // The header is positioned to float over the hero section
    <header className="absolute top-0 left-0 right-0 z-30 py-4 px-6 md:px-10">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Logo: Simplified to match the screenshot's style */}
        <Link to="/" className="text-2xl font-bold text-gray-800">
          AI Docs Manager
        </Link>

        {/* Navigation: Using minimal links as requested */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
            Dashboard
          </Link>
          <Link to="/documents" className="text-gray-600 hover:text-gray-900 transition-colors">
            Documents
          </Link>
        </nav>

        {/* Auth Button: Replaces "Start for Free" with your Login/Logout logic */}
        <div>
          {user ? (
            // Button shown when the user IS logged in
            <Button
              className="bg-gray-800 text-white hover:bg-gray-700 rounded-lg shadow-md px-5 py-2 flex items-center"
              onClick={logout}
            >
              <User className="h-4 w-4 mr-2" />
              Logout
            </Button>
          ) : (
            // Button shown when the user IS NOT logged in
            <Button
              asChild
              className="bg-gray-800 text-white hover:bg-gray-700 rounded-lg shadow-md px-5 py-2"
            >
              <Link to="/login" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Login
              </Link>
            </Button>
          )}
        </div>

      </div>
    </header>
  );
};


//=================================================================
// 2. HERO SECTION COMPONENT (UNCHANGED)
//=================================================================
const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [promptText, setPromptText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [displayedSummary, setDisplayedSummary] = useState("");
  const [shrinkHero, setShrinkHero] = useState(false);
  const [uploadSource, setUploadSource] = useState(null); // 'device' | 'gmail'
  const [showSendAnim, setShowSendAnim] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const fileInputRef = useRef(null);

  const getDepartmentIcon = (dept) => {
    const name = String(dept || '').toLowerCase();
    if (name.includes('hr')) return <Users className="h-4 w-4" />;
    if (name.includes('it')) return <Cpu className="h-4 w-4" />;
    if (name.includes('finance')) return <Banknote className="h-4 w-4" />;
    if (name.includes('operation')) return <Cog className="h-4 w-4" />;
    if (name.includes('legal')) return <Scale className="h-4 w-4" />;
    return <Users className="h-4 w-4" />;
  };

  const sanitizeSummary = (raw) => {
    if (!raw) return "";
    let text = String(raw).trim();
    text = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    // Try parse JSON and pick summary field if present
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object") {
        if (typeof parsed.summary === "string") return parsed.summary.trim();
        // If array of objects with summary
        if (Array.isArray(parsed)) {
          const found = parsed.find((x) => x && typeof x.summary === "string");
          if (found) return String(found.summary).trim();
        }
        // Fallback: join string values
        const maybe = Object.values(parsed).find((v) => typeof v === "string");
        if (maybe) return String(maybe).trim();
      }
    } catch {}
    // Remove obvious labels like "summary:", "department:", braces, etc.
    text = text.replace(/\b(summary|department)\s*[:=]/gi, "");
    text = text.replace(/[{}\[\]"]/g, "").trim();
    return text;
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage(`Selected: ${file.name}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { setShowAuthDialog(true); return; }
    if (!selectedFile) {
      setMessage("Please attach a file to analyze.");
      return;
    }
    try {
      setIsUploading(true);
      setProgress(10);
      const base64 = await fileToBase64(selectedFile);
      setProgress(40);
      const response = await apiService.analyzeDocument(base64, selectedFile.name, promptText.trim() || undefined);
      setProgress(100);
      const cleanSummary = sanitizeSummary(response?.summary);
      const cleaned = { ...response, summary: cleanSummary };
      setResult(cleaned);
      setShrinkHero(true);
      // Typewriter animation
      setDisplayedSummary("");
      const full = cleanSummary || "";
      let i = 0;
      const step = () => {
        i += 1;
        setDisplayedSummary(full.slice(0, i));
        if (i < full.length) {
          setTimeout(step, 15);
        }
      };
      if (full.length > 0) {
        setTimeout(() => {
          step();
          const estMs = Math.max(400, full.length * 15 + 150);
          setTimeout(() => {
            setShowSendAnim(true);
            setTimeout(() => { setShowSendAnim(false); }, 10000);
          }, estMs);
        }, 15);
      }
      setMessage("Analysis complete.");
    } catch (err) {
      setMessage(err?.message || "Upload failed");
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const triggerDevicePicker = () => {
    if (!user) { setShowAuthDialog(true); return; }
    setUploadSource('device');
    fileInputRef.current?.click();
  };

  const handleGmailImport = async () => {
    try {
      setMessage("");
      setUploadSource('gmail');
      if (!user) { setShowAuthDialog(true); return; }
      const { auth_url, state } = await apiService.getGmailAuthUrl(user.id);
      const w = 600, h = 700;
      const left = window.screenX + (window.outerWidth - w) / 2;
      const top = window.screenY + (window.outerHeight - h) / 2;
      const popup = window.open(auth_url, "gmail_oauth", `width=${w},height=${h},left=${left},top=${top}`);
      await new Promise((resolve) => {
        const timer = setInterval(() => {
          if (!popup || popup.closed) {
            clearInterval(timer);
            resolve();
          }
        }, 700);
        setTimeout(() => { try { clearInterval(timer); } catch {} resolve(); }, 120000);
      });
      const res = await apiService.importFromGmail(state, { query: 'is:unread has:attachment newer_than:30d', maxResults: 25 });
      setMessage(`Imported ${res?.imported || 0} attachments from Gmail. Check Documents/Dashboard.`);
    } catch (e) {
      setMessage(e?.message || "Gmail import failed.");
    }
  };

  return (
    <>
    <section
      className="relative min-h-screen flex items-center justify-center text-center overflow-hidden"
      style={{
        background: 'linear-gradient(120deg, #d4f8e8 0%, #d4e4f8 100%)'
      }}
    >
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col items-center ${shrinkHero ? 'space-y-3' : 'space-y-6'} max-w-4xl mx-auto ${shrinkHero ? 'pt-16' : 'pt-24'}`}>
          
          
          
          <h1 className={`${shrinkHero ? 'text-3xl md:text-4xl lg:text-5xl' : 'text-5xl md:text-6xl lg:text-7xl'} font-extrabold text-gray-800 tracking-tight leading-tight`}>
            AI Summary <br /> & Document Manager
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered Docs Manager designed to build, scale, and elevate your business.
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto pt-4">
            <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-300 shadow-lg p-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
                    <Paperclip className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); triggerDevicePicker(); }}>
                    <ImageIcon className="h-4 w-4 mr-2" /> Upload from device
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleGmailImport(); }}>
                    <Inbox className="h-4 w-4 mr-2" /> Import from Gmail
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,image/*" />
              <Input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Add an optional instruction for analysis..."
                className="border-0 focus-visible:ring-0 text-base"
              />
              <Button type="submit" disabled={isUploading} className="shrink-0 bg-gray-800 text-white hover:bg-gray-700 rounded-lg px-4 py-2">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {isUploading || progress > 0 ? (
              <div className="mt-3">
                <div className="text-sm text-gray-600">{message}</div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
                  <div className="h-2 bg-gray-800 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : (
              message ? <div className="mt-3 text-sm text-gray-600">{message}</div> : null
            )}
            {result ? (
              <>
                <div className="mt-4 text-left bg-white/70 border border-white/80 rounded-lg p-4">
                  <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {displayedSummary || result.summary}
                  </div>
                </div>
                {showSendAnim && (
                  <div className="mt-3 relative h-24">
                    {/* Curved path (SVG) */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 96" preserveAspectRatio="none">
                      <path d="M20,76 C120,10 200,10 300,20" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 6" />
                    </svg>
                    {/* Source pill with icon */}
                    <div className="absolute left-0 bottom-2 inline-flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-full px-3 py-1 text-xs text-gray-700">
                      {uploadSource === 'gmail' ? <Inbox className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}
                      <span>{uploadSource === 'gmail' ? 'Gmail' : 'Device'}</span>
                    </div>
                    {/* Department pill with icon */}
                    <div className="absolute right-0 top-0 inline-flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-full px-3 py-1 text-xs text-gray-700">
                      {getDepartmentIcon(result.department)}
                      <span>{result.department || 'Unknown'}</span>
                    </div>
                    {/* Moving document along the path using motion-path */}
                    <div className="absolute left-0 top-0 h-8 w-6 bg-yellow-300 rounded-sm shadow [offset-path:path('M20,76_C120,10_200,10_300,20')] [offset-rotate:0deg] [animation:sendDocPath_1.2s_ease-in-out_forwards]" />
                  </div>
                )}
              </>
            ) : null}
          </form>

        </div>
      </div>
    </section>
    <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in required</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          Please sign in to upload or import documents.
        </div>
        <DialogFooter className="sm:justify-end gap-2">
          <Button variant="outline" onClick={() => setShowAuthDialog(false)}>Cancel</Button>
          <Button onClick={() => navigate('/login')}>Sign in</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

//=================================================================
// 3. PARENT COMPONENT TO RENDER BOTH
//=================================================================
const HomePage = () => {
  return (
    <>
      <Header />
      <HeroSection />
    </>
  );
};

export default HomePage;