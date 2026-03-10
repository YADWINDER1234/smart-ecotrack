import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const breadcrumbMap: { [key: string]: string } = {
  admin: "Admin",
  "admin/products": "Products",
  "admin/complaints": "Complaints",
  "admin/audit": "Audit Logs",
  "admin/overrides": "Admin Controls",
  dashboard: "Dashboard",
  scan: "Scan QR",
  login: "Login",
  register: "Register",
  "recycler/events": "Recycling Events",
  "manufacturer/products": "My Products"
};

export function Breadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname
    .split("/")
    .filter((p) => p && p !== "api")
    .slice(1);

  if (pathSegments.length === 0) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground whitespace-nowrap overflow-x-auto scroller-hide">
      <Link to="/" className="flex items-center hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>
      {pathSegments.map((segment, index) => {
        const path = "/" + pathSegments.slice(0, index + 1).join("/");
        const label = breadcrumbMap[pathSegments.slice(0, index + 1).join("/")] || segment;
        const isLast = index === pathSegments.length - 1;

        return (
          <div key={path} className="flex items-center space-x-1">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link to={path} className="hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
