import { useAuth } from "../hooks/useAuth";
import * as authApi from "../api/authApi";
import { Label } from "@/components/ui/label";

const ROLES: authApi.Role[] = ["ADMIN", "MANUFACTURER", "RECYCLER", "CONSUMER"];

export function RoleSwitcher() {
  const auth = useAuth();

  // Only show if user is admin
  if (auth.user?.role !== "ADMIN") {
    return null;
  }

  const currentViewedRole = auth.displayUser?.role || auth.user?.role;

  const handleRoleChange = (role: authApi.Role) => {
    auth.switchViewRole?.(role);
  };

  return (
    <div className="flex items-center space-x-2 rounded-md border p-1 bg-background/50 backdrop-blur-sm">
      <Label className="text-xs text-muted-foreground px-2">View as:</Label>
      <select 
        className="h-7 w-auto bg-transparent text-sm focus:outline-none focus:ring-0 cursor-pointer text-foreground"
        value={currentViewedRole} 
        onChange={(e) => handleRoleChange(e.target.value as authApi.Role)}
      >
        {ROLES.map((role) => (
          <option className="bg-background text-foreground" key={role} value={role}>
            {role.charAt(0) + role.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
      {currentViewedRole !== auth.user?.role && (
        <span className="text-[10px] font-medium text-destructive px-1 border-l">
          (Actual: {auth.user?.role?.charAt(0) + auth.user?.role?.slice(1).toLowerCase()})
        </span>
      )}
    </div>
  );
}
