import { Link } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ShieldCheck, BarChart3, Recycle, ArrowRight } from "lucide-react";

export function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-32">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
          
          <div className="container mx-auto px-4 md:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-3xl text-center"
            >
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6">
                Next-generation
                <span className="block text-primary">Sustainability Tracking</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground mb-10 max-w-2xl mx-auto">
                Scan a product QR to view sustainability metadata, eco-score, and guided recycling
                actions with end-to-end traceability. Join the circular economy today.
              </p>
              <div className="flex items-center justify-center gap-x-4">
                <Link to="/scan">
                  <Button size="lg" className="h-12 px-8 text-base">
                    Scan a QR <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                {user ? (
                  <Link to="/dashboard">
                    <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                      Open Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link to="/login">
                    <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 sm:py-32 bg-muted/30">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid gap-8 md:grid-cols-3"
            >
              <Card className="border-none shadow-md bg-background/50 backdrop-blur-sm transition-transform hover:-translate-y-1">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Secure validation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Signed QR payloads verified server-side with expiry and revocation to ensure maximum integrity.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-background/50 backdrop-blur-sm transition-transform hover:-translate-y-1">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-emerald-500" />
                  </div>
                  <CardTitle className="text-xl">Eco-score engine</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Rule-based weighted scoring with intelligent breakdown and standard compliance labels.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-background/50 backdrop-blur-sm transition-transform hover:-translate-y-1">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                    <Recycle className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle className="text-xl">Workflow lifecycle</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Enforced state transitions from scan → intent → receipt → sorting → final disposition.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}

