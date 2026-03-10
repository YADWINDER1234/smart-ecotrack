import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Shield, Package, AlertCircle, FileText, CalendarCheck } from "lucide-react";

export function RoleSidebar({ className }: { className?: string }) {
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
    <aside className={cn("hidden md:block w-64 flex-shrink-0 border-r pr-6", className)}>
      <nav className="sticky top-24">
        <div className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Navigation
        </div>
        <ul className="space-y-1">
          <li>
            <NavLink to="/dashboard" className={getLinkClass}>
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </NavLink>
          </li>
          
          {viewedRole === "ADMIN" && (
            <>
              <li>
                <NavLink to="/admin" className={getLinkClass} end>
                  <Shield className="h-4 w-4" />
                  <span>Admin Home</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/products" className={getLinkClass}>
                  <Package className="h-4 w-4" />
                  <span>Products</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/complaints" className={getLinkClass}>
                  <AlertCircle className="h-4 w-4" />
                  <span>Complaints</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/audit" className={getLinkClass}>
                  <FileText className="h-4 w-4" />
                  <span>Audit Logs</span>
                </NavLink>
              </li>
            </>
          )}
          
          {viewedRole === "RECYCLER" && (
            <>
              <li>
                <NavLink to="/recycler/events" className={getLinkClass}>
                  <CalendarCheck className="h-4 w-4" />
                  <span>My Events</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/recycler/complaints" className={getLinkClass}>
                  <AlertCircle className="h-4 w-4" />
                  <span>Complaints</span>
                </NavLink>
              </li>
            </>
          )}

          {viewedRole === "MANUFACTURER" && (
            <>
              <li>
                <NavLink to="/manufacturer/products" className={getLinkClass}>
                  <Package className="h-4 w-4" />
                  <span>My Products</span>
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
