import { useEffect, useState, useRef, useCallback } from "react";
import { Navbar } from "../components/layout/Navbar";
import RoleSidebar from "../components/RoleSidebar";
import { Breadcrumb } from "../components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, ScanLine, Recycle, Zap, Upload } from "lucide-react";
import { classifyWaste, detectFromCamera } from "../api/wasteApi";
import { ProductIntelligenceDashboard } from "../components/ProductIntelligenceDashboard";

export function WasteDetectionPage() {
  const [category, setCategory] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
        
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
        
        const fullBase64 = canvas.toDataURL("image/jpeg", 0.7);
        const base64String = fullBase64.split(",")[1];
        
        setLoading(true);
        setResult(null);
        setError(null);
        try {
          const data = await detectFromCamera(base64String);
          setResult(data);
        } catch (err: any) {
          console.error(err);
          setError(err?.response?.data?.error?.message || err?.message || "AI detection failed. Please try again.");
        } finally {
          setLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  async function handleClassify() {
    if (!category.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await classifyWaste(category, {});
      setResult(data);
    } catch (err: any) { 
      console.error(err); 
      setError(err?.response?.data?.error?.message || err?.message || "Classification failed. Please try again.");
    } finally { 
      setLoading(false); 
    }
  }

  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    setCameraActive(true);
    setStream(null); // Reset
    
    try {
      // Try environment first
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      setStream(s);
    } catch (err) {
      console.error("Camera environment access error:", err);
      try {
        // Fallback to any camera
        const fallbackS = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(fallbackS);
      } catch (fallbackErr) {
        console.error("All camera access denied:", fallbackErr);
        setCameraActive(false);
        alert("Camera access denied. Please ensure you have a camera and have granted browser permissions.");
      }
    }
  }, []);

  // Attach stream to video element whenever both are available
  useEffect(() => {
    if (stream && videoRef.current) {
      console.log("Attaching stream to video element...");
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(e => console.error("Play error:", e));
      };
    }
  }, [stream]);

  function stopCamera() {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setCameraActive(false);
  }

  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  async function captureAndDetect() {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    
    const MAX_WIDTH = 800;
    const MAX_HEIGHT = 600;
    let width = videoRef.current.videoWidth;
    let height = videoRef.current.videoHeight;
    
    if (width > MAX_WIDTH) {
      height = Math.round((height * MAX_WIDTH) / width);
      width = MAX_WIDTH;
    }
    if (height > MAX_HEIGHT) {
      width = Math.round((width * MAX_HEIGHT) / height);
      height = MAX_HEIGHT;
    }
    
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0, width, height);
    const fullBase64 = canvas.toDataURL("image/jpeg", 0.7);
    const base64Data = fullBase64.split(",")[1];
    
    setCapturedImage(fullBase64);
    setLoading(true);
    setResult(null);
    setError(null);
    
    // Stop camera immediately to "freeze" the frame
    stopCamera();

    try {
      const data = await detectFromCamera(base64Data);
      setResult(data);
    } catch (err: any) { 
      console.error(err); 
      setError(err?.response?.data?.error?.message || err?.message || "AI detection failed. Please try again.");
    } finally { 
      setLoading(false); 
    }
  }

  useEffect(() => {
    return () => { 
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [stream]);

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <Navbar />
      <main className="container mx-auto flex flex-col md:flex-row gap-8 py-8 px-4 md:px-8">
        <RoleSidebar />
        <div className="flex-1 space-y-6">
          <Breadcrumb />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">AI Product Hub</h1>
                <p className="text-sm text-muted-foreground font-medium">Universal Intelligence & Lifecycle Command</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold uppercase tracking-widest">
              <Zap className="h-3.5 w-3.5" />
              Gemma 3 27B High-Performance
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{error}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setError(null)} className="h-8 px-2 hover:bg-destructive/20">
                Dismiss
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Camera Detection */}
            <Card className="border-none shadow-sm overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <CardHeader className="relative z-10">
                <CardTitle className="text-lg flex items-center gap-2"><Camera className="h-5 w-5 text-primary" /> AI Vision Scan</CardTitle>
                <CardDescription>Snap a photo to identify any product architecture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                {cameraActive || capturedImage ? (
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden border-2 border-primary/20 bg-black aspect-video group-hover:border-primary/40 transition-all">
                      {capturedImage ? (
                        <img src={capturedImage} className="w-full h-full object-cover" alt="Captured product" />
                      ) : (
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      )}
                      
                      {loading && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-white font-bold text-sm">Synthesizing Product Data...</p>
                          </div>
                        </div>
                      )}

                      {!loading && !capturedImage && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-48 h-48 border-2 border-dashed border-primary/30 rounded-2xl animate-pulse" />
                          <div className="absolute top-0 w-full h-1 bg-primary/30 animate-scan" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {!capturedImage ? (
                        <>
                          <Button onClick={captureAndDetect} disabled={loading} className="flex-1 h-12 text-base shadow-lg shadow-primary/20">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Camera className="h-5 w-5 mr-2" />}
                            Capture & Analyze
                          </Button>
                          <Button variant="outline" onClick={stopCamera} className="h-12 px-6">Cancel</Button>
                        </>
                      ) : (
                        <Button 
                          variant="outline" 
                          onClick={() => { setCapturedImage(null); startCamera(); }} 
                          disabled={loading} 
                          className="w-full h-12"
                        >
                          Retake Photo
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Button onClick={startCamera} variant="outline" className="w-full h-32 flex flex-col gap-2 border-dashed border-2 rounded-2xl bg-primary/5 border-primary/20 hover:bg-primary/10 transition-all">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Camera className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-center">
                        <span className="block text-sm font-bold text-foreground">Launch Intelligence Vision</span>
                        <span className="text-xs text-muted-foreground mt-1">Identify specs, health & sustainability</span>
                      </div>
                    </Button>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileUpload} 
                      />
                      <Button 
                        onClick={() => fileInputRef.current?.click()} 
                        disabled={loading}
                        variant="outline" 
                        className="w-full h-14 border-dashed border-2 rounded-xl bg-muted/30 border-muted-foreground/30 hover:bg-muted/50 transition-all"
                      >
                        {loading && !cameraActive ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium text-foreground">Upload Picture</span>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Text Search */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Recycle className="h-5 w-5 text-primary" /> Manual Identity Look-up</CardTitle>
                <CardDescription>Enter product name or code for deep analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="flex gap-2">
                  <input id="waste-category" placeholder="e.g. iPhone 15 Pro, Dell XPS 13..."
                    value={category} onChange={e => setCategory(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleClassify()}
                    className="flex-1 rounded-xl border border-input bg-background/50 px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all" />
                  <Button onClick={handleClassify} disabled={loading || !category.trim()} className="h-10 px-6">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                    Analyze
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {["Smartphones", "Laptops", "Home Cooling", "Battery Packs", "Old Electronics"].map(c => (
                    <button key={c} onClick={() => { setCategory(c); }}
                      className="px-3 py-1.5 rounded-lg bg-muted text-[10px] font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-all">
                      {c}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* New Dashboard Results */}
          {(loading || result) && (
            <ProductIntelligenceDashboard data={result} loading={loading} />
          )}

          {!result && !loading && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-border rounded-3xl bg-muted/5">
              <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center">
                <ScanLine className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-muted-foreground">Ready for Intelligence Scan</h3>
                <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto">Use the camera or search above to retrieve real-time product specs and management insights.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
