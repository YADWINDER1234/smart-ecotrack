import { useEffect, useState, useRef, useCallback } from "react";
import { Navbar } from "../components/layout/Navbar";
import RoleSidebar from "../components/RoleSidebar";
import { Breadcrumb } from "../components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, ScanLine, Recycle, AlertTriangle, Info } from "lucide-react";
import { classifyWaste, detectFromCamera } from "../api/wasteApi";

const WASTE_TYPE_ICONS: Record<string, string> = {
  PLASTIC: "♻️", METAL: "🔩", GLASS: "🫙", PAPER: "📄",
  ORGANIC: "🍂", EWASTE: "💻", HAZARDOUS: "☢️", GENERAL: "🗑️"
};

const WASTE_TYPE_COLORS: Record<string, string> = {
  PLASTIC: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  METAL: "bg-gray-500/10 text-gray-600 border-gray-500/30",
  GLASS: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30",
  PAPER: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  ORGANIC: "bg-green-500/10 text-green-600 border-green-500/30",
  EWASTE: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  HAZARDOUS: "bg-red-500/10 text-red-600 border-red-500/30",
  GENERAL: "bg-slate-500/10 text-slate-600 border-slate-500/30"
};

export function WasteDetectionPage() {
  const [category, setCategory] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraResult, setCameraResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function handleClassify() {
    if (!category.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await classifyWaste(category);
      setResult(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Camera access denied. Please allow camera permissions.");
    }
  }, []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }

  async function captureAndDetect() {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
    setLoading(true);
    setCameraResult(null);
    try {
      const data = await detectFromCamera(base64);
      setCameraResult(data);
      stopCamera();
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  function ResultCard({ data, title }: { data: any; title: string }) {
    if (!data) return null;
    const colorClass = WASTE_TYPE_COLORS[data.wasteType] || WASTE_TYPE_COLORS.GENERAL;
    return (
      <Card className="border-none shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className={`text-4xl p-3 rounded-xl border ${colorClass}`}>
              {WASTE_TYPE_ICONS[data.wasteType] || "🗑️"}
            </div>
            <div>
              <h3 className="text-xl font-bold">{data.wasteType}</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden max-w-[120px]">
                  <div className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{ width: `${(data.confidence * 100)}%` }} />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{(data.confidence * 100).toFixed(0)}% confidence</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 border border-border/50">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm mb-1">Target Bin: <span className="text-primary">{data.targetBin || data.disposal?.targetBin}</span></p>
                <p className="text-sm text-muted-foreground leading-relaxed">{data.disposal?.instructions}</p>
              </div>
            </div>
          </div>

          {data.disposal?.isHazardous && (
            <div className="flex items-center gap-2 bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-lg border border-red-500/20">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-bold">Hazardous Material — Special handling required!</span>
            </div>
          )}

          {data.disposal?.rewardMultiplier > 1 && (
            <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 p-3 rounded-lg border border-yellow-500/20">
              <span className="text-lg">⭐</span>
              <span className="text-sm font-bold">{data.disposal.rewardMultiplier}x Reward Multiplier!</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <Navbar />
      <main className="container mx-auto flex flex-col md:flex-row gap-8 py-8 px-4 md:px-8">
        <RoleSidebar />
        <div className="flex-1 space-y-6">
          <Breadcrumb />
          <div className="flex items-center gap-2 mt-2">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <ScanLine className="h-6 w-6 text-cyan-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Waste Detection</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Text Classification */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Recycle className="h-5 w-5" /> Classify by Category</CardTitle>
                <CardDescription>Enter a product category to identify waste type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <input id="waste-category" placeholder="e.g. electronics, plastic bottle, battery..."
                    value={category} onChange={e => setCategory(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleClassify()}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <Button onClick={handleClassify} disabled={loading || !category.trim()}>
                    {loading && !cameraActive ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ScanLine className="h-4 w-4 mr-2" />}
                    Classify
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["electronics", "plastic", "glass", "battery", "paper", "food", "metal"].map(c => (
                    <button key={c} onClick={() => { setCategory(c); }}
                      className="px-3 py-1 rounded-full bg-muted/50 text-xs font-medium hover:bg-muted transition-colors">
                      {c}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Camera Detection */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Camera className="h-5 w-5" /> AI Camera Detection</CardTitle>
                <CardDescription>Take a photo for AI-powered waste classification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cameraActive ? (
                  <div className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden border border-border bg-black">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-48 object-cover" />
                      <div className="absolute inset-0 border-2 border-dashed border-primary/30 m-4 rounded-lg pointer-events-none" />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={captureAndDetect} disabled={loading} className="flex-1">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
                        Capture & Detect
                      </Button>
                      <Button variant="outline" onClick={stopCamera}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={startCamera} variant="outline" className="w-full h-32 flex flex-col gap-2 border-dashed border-2">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to open camera</span>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          {result && <ResultCard data={result} title="Classification Result" />}
          {cameraResult && <ResultCard data={cameraResult} title="AI Detection Result" />}
        </div>
      </main>
    </div>
  );
}
