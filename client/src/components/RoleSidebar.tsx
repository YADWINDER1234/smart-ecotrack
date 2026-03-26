import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Shield, Package, AlertCircle, FileText, CalendarCheck, Trash2, Trophy, ScanLine, Route, ShieldCheck } from "lucide-react";

export function RoleSidebar({ className, mobile }: { className?: string; mobile?: boolean }) {
  const { user, displayUser } = useAuth();
  const viewedRole = displayUser?.role || user?.role;

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all mb-1",
      isActive
        ? "bg-primary/15 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    );

  return (
    <aside className={cn(mobile ? "w-full" : "hidden md:block w-64 flex-shrink-0 border-r pr-6", className)}>
      <nav className={mobile ? "" : "sticky top-24"}>
        <div className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Navigation
        </div>
        <ul className="space-y-1">
          <li>
            <NavLink to="/dashboard" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass}>
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </NavLink>
          </li>

          {/* Shared links for all roles */}
          <li>
            <NavLink to="/rewards" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass}>
              <Trophy className="h-4 w-4" />
              <span>Rewards</span>
            </NavLink>
          </li>

          {viewedRole === "ADMIN" && (
            <>
              <li>
                <NavLink to="/admin" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass} end>
                  <Shield className="h-4 w-4" />
                  <span>Admin Home</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/products" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass}>
                  <Package className="h-4 w-4" />
                  <span>Products</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/complaints" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass}>
                  <AlertCircle className="h-4 w-4" />
                  <span>Complaints</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/audit" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass}>
                  <FileText className="h-4 w-4" />
                  <span>Audit Logs</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/bins" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass}>
                  <Trash2 className="h-4 w-4" />
                  <span>Smart Bins</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/route-optimization" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass}>
                  <Route className="h-4 w-4" />
                  <span>Route Optimizer</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/blockchain" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass}>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Blockchain</span>
                </NavLink>
              </li>
            </>
          )}

          {viewedRole === "RECYCLER" && (
            <>
              <li>
                <NavLink to="/recycler/events" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass}>
                  <CalendarCheck className="h-4 w-4" />
                  <span>My Events</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/recycler/complaints" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass}>
                  <AlertCircle className="h-4 w-4" />
                  <span>Complaints</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/bins" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass}>
                  <Trash2 className="h-4 w-4" />
                  <span>Smart Bins</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/route-optimization" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass}>
                  <Route className="h-4 w-4" />
                  <span>Route Optimizer</span>
                </NavLink>
              </li>
            </>
          )}

          {viewedRole === "MANUFACTURER" && (
            <>
              <li>
                <NavLink to="/manufacturer/products" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass}>
                  <Package className="h-4 w-4" />
                  <span>My Products</span>
                </NavLink>
              </li>
            </>
          )}

          {viewedRole === "CONSUMER" && (
            <>
              <li>
                <NavLink to="/waste-detection" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass}>
                  <ScanLine className="h-4 w-4" />
                  <span>Waste Detection</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
}

export default RoleSidebar;
