import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import * as complaintApi from "../../api/complaintApi";
import { RoleSwitcher } from "../RoleSwitcher";
import RoleSidebar from "../RoleSidebar";
import { Breadcrumb } from "../Breadcrumb";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Sprout, Scan, LogOut, LayoutDashboard, UserPlus, LogIn, Menu, X } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [openCount, setOpenCount] = useState<number>(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleClose = () => setDrawerOpen(false);
    window.addEventListener("close-drawer", handleClose);
    return () => window.removeEventListener("close-drawer", handleClose);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.body.classList.toggle("theme-dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (user?.role !== "ADMIN") return;
      try {
        const { complaints } = await complaintApi.listOpenComplaints();
        if (!cancelled) setOpenCount(complaints.length);
      } catch {
        // ignore
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const es = new EventSource(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/notifications/stream`, { withCredentials: true } as any);
    es.addEventListener("audit", () => {
      try {
        if (user.role === "ADMIN") {
          setOpenCount((c) => c + 0);
        }
      } catch {
        // ignore
      }
    });
    es.addEventListener("connected", () => {
      // ignore
    });
    return () => es.close();
  }, [user]);

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm transition-opacity" 
          onClick={() => setDrawerOpen(false)} 
        />
      )}

      {/* Mobile Drawer Panel */}
      <div className={`fixed inset-y-0 left-0 z-[101] w-3/4 max-w-sm bg-background border-r shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b">
          <span className="font-bold text-lg flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" /> Menu
          </span>
          <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <RoleSidebar mobile={true} />
        </div>
      </div>

      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center">
            {user && (
              <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setDrawerOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <Link to="/" className="flex items-center space-x-2 mr-6">
              <Sprout className="h-6 w-6 text-primary" />
              <span className="font-bold sm:inline-block">Smart EcoTrack</span>
            </Link>
          </div>
          
          <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
            <Link to="/scan" className="transition-colors hover:text-primary text-muted-foreground flex items-center gap-2">
              <Scan className="h-4 w-4" />
              <span className="hidden sm:inline-block">Scan</span>
            </Link>
            
            {user?.role === "ADMIN" && (
              <>
                <Link to="/admin/products" className="hidden md:inline-block transition-colors hover:text-primary text-muted-foreground">
                  Admin
                </Link>
                <Link to="/admin/complaints" className="hidden md:flex transition-colors hover:text-primary text-muted-foreground items-center gap-1">
                  Complaints
                  {openCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                      {openCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {user?.role === "RECYCLER" && (
              <Link to="/recycler/events" className="hidden md:inline-block transition-colors hover:text-primary text-muted-foreground">
                Recycler
              </Link>
            )}
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => setDark(!dark)}>
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            {user ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <div className="hidden md:block">
                  <RoleSwitcher />
                </div>
                <Button variant="outline" size="sm" onClick={() => logout()}>
                  <LogOut className="sm:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline-block">Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        {(location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register') && (
          <div className="border-b bg-muted/40">
            <div className="container mx-auto px-4 py-2 md:px-8">
              <Breadcrumb />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
