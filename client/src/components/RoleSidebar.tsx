import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Shield, Package, AlertCircle, FileText, CalendarCheck, Zap, Leaf } from "lucide-react";

import { motion } from "framer-motion";

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

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: mobile ? 0.2 : 0, // delay slightly if in mobile drawer
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    },
  };

  const ECO_TIPS = [
    "Recycling one aluminium can saves enough energy to run a TV for 3 hours! ♻️",
    "Glass is 100% recyclable and can be recycled endlessly without quality loss. 🔄",
    "Composting food waste reduces methane emissions from landfills. 🌱",
    "Buying second-hand extends product life and cuts carbon footprint in half. 🛍️",
    "One tonne of recycled paper saves 17 trees and 26,000 litres of water. 🌳",
  ];

  const tip = ECO_TIPS[Math.floor((Date.now() / 86400000) % ECO_TIPS.length)];

  return (
    <aside className={cn(mobile ? "w-full flex flex-col h-full" : "hidden md:flex flex-col w-64 flex-shrink-0 border-r pr-6", className)}>
      <nav className={cn("flex-1", mobile ? "" : "sticky top-24")}>
        <div className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Navigation
        </div>
        <motion.ul 
          className="space-y-1"
          initial="hidden"
          animate="visible"
          variants={listVariants}
        >
          <motion.li variants={itemVariants}>
            <NavLink to="/dashboard" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass}>
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </NavLink>
          </motion.li>

          {/* Shared links for all roles */}
          <motion.li variants={itemVariants}>
            <NavLink to="/waste-detection" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass}>
              <Zap className="h-4 w-4" />
              <span>AI Product Hub</span>
            </NavLink>
          </motion.li>

          {viewedRole === "ADMIN" && (
            <>
              <motion.li variants={itemVariants}>
                <NavLink to="/admin" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass} end>
                  <Shield className="h-4 w-4" />
                  <span>Admin Home</span>
                </NavLink>
              </motion.li>
              <motion.li variants={itemVariants}>
                <NavLink to="/admin/products" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass}>
                  <Package className="h-4 w-4" />
                  <span>Products</span>
                </NavLink>
              </motion.li>
              <motion.li variants={itemVariants}>
                <NavLink to="/admin/complaints" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass}>
                  <AlertCircle className="h-4 w-4" />
                  <span>Complaints</span>
                </NavLink>
              </motion.li>
              <motion.li variants={itemVariants}>
                <NavLink to="/admin/audit" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass}>
                  <FileText className="h-4 w-4" />
                  <span>Audit Logs</span>
                </NavLink>
              </motion.li>
            </>
          )}

          {viewedRole === "RECYCLER" && (
            <>
              <motion.li variants={itemVariants}>
                <NavLink to="/recycler/events" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass}>
                  <CalendarCheck className="h-4 w-4" />
                  <span>My Events</span>
                </NavLink>
              </motion.li>
              <motion.li variants={itemVariants}>
                <NavLink to="/recycler/complaints" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass}>
                  <AlertCircle className="h-4 w-4" />
                  <span>Complaints</span>
                </NavLink>
              </motion.li>
            </>
          )}

          {viewedRole === "MANUFACTURER" && (
            <>
              <motion.li variants={itemVariants}>
                <NavLink to="/manufacturer/products" onClick={() => window.dispatchEvent(new Event("close-drawer"))} className={getLinkClass}>
                  <Package className="h-4 w-4" />
                  <span>My Products</span>
                </NavLink>
              </motion.li>
            </>
          )}

          {viewedRole === "CONSUMER" && (
            <>
              {/* Consumer specific links can go here in the future */}
            </>
          )}
        </motion.ul>
      </nav>

      {/* Sidebar Footer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="mt-auto pt-4 border-t border-border space-y-3"
      >
        {/* User Profile Card */}
        {user && (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 bg-muted/50">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm">
              {user.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{(displayUser?.role ?? user.role).toLowerCase()}</p>
            </div>
          </div>
        )}

        {/* Daily Eco Tip */}
        <div className="rounded-lg px-3 py-3 bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Leaf className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Eco Tip</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
        </div>
      </motion.div>
    </aside>
  );
}

export default RoleSidebar;
