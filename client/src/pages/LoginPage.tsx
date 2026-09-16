import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle2, Info, Copy, Check } from "lucide-react";

export function LoginPage() {
  const auth = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [copiedCredential, setCopiedCredential] = useState<string | null>(null);

  const testCredentials = [
    { role: "Admin", email: "admin@ecotrack.dev", password: "Admin@1234!" },
    { role: "Manufacturer", email: "manufacturer@ecotrack.dev", password: "Manufacturer@1234!" },
    { role: "Recycler", email: "recycler@ecotrack.dev", password: "Recycler@1234!" },
    { role: "Consumer", email: "consumer@ecotrack.dev", password: "Consumer@1234!" },
  ];

  const copyToClipboard = (text: string, credName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCredential(credName);
    setTimeout(() => setCopiedCredential(null), 2000);
  };

  useEffect(() => {
    if (auth.user) {
      if (!loading) {
        nav("/dashboard");
      }
    }
  }, [auth.user, loading, nav]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await auth.login({ email, password });
      setSuccess(true);
      setTimeout(() => {
        nav("/dashboard");
      }, 500);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.response?.data?.error?.message ?? err?.message ?? "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <main className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
        <Card className="w-full max-w-md shadow-lg border-muted/50">
          <CardHeader className="space-y-2 text-center relative pb-6">
            <button
              onClick={() => setShowCredentials(!showCredentials)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted transition-colors"
              title="View test credentials"
            >
              <Info className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
            <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showCredentials && (
              <div className="mb-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-blue-900 dark:text-blue-200">Test Credentials (Dev Mode)</h3>
                </div>
                <div className="space-y-2 text-sm">
                  {testCredentials.map((cred, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-700 dark:text-slate-300">{cred.role}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{cred.email}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">pwd: {cred.password}</div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => copyToClipboard(cred.email, `email-${idx}`)}
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="Copy email"
                        >
                          {copiedCredential === `email-${idx}` ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(cred.password, `pwd-${idx}`)}
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="Copy password"
                        >
                          {copiedCredential === `pwd-${idx}` ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {success && (
              <div className="mb-4 flex items-center gap-2 rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Login successful! Redirecting...</span>
              </div>
            )}
            {error && !success && (
              <div className="mb-4 flex items-start gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="flex flex-col gap-1">
                  <span>{error}</span>
                  {error.includes("Network error") && (
                    <span className="text-xs opacity-90">
                      Is the backend running? <a href="/api/health" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:opacity-80">Health check</a>
                    </span>
                  )}
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading || success}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading || success}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || success}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Signed in!
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col pt-0 gap-4 text-center">
            <div className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-primary hover:underline transition-all">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

