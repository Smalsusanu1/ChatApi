import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

type SidebarProps = {
  mobile?: boolean;
  onClose?: () => void;
};

export function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform md:translate-x-0",
        mobile ? "-translate-x-full" : ""
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
            <span className="material-icons text-sm">api</span>
          </div>
          <span className="ml-3 font-medium text-lg">API Dashboard</span>
        </div>
        {mobile && (
          <button className="md:hidden" onClick={onClose}>
            <span className="material-icons text-neutral-500">close</span>
          </button>
        )}
      </div>
      
      <div className="py-4">
        <div className="px-4 mb-2 text-xs font-medium text-neutral-500 uppercase">General</div>
        <Link href="/">
          <a className={cn(
            "flex items-center px-4 py-2",
            location === "/" 
              ? "text-primary-500 bg-primary-50 border-l-4 border-primary-500" 
              : "text-neutral-600 hover:bg-neutral-50"
          )}>
            <span className="material-icons mr-3">dashboard</span>
            Dashboard
          </a>
        </Link>
        <Link href="/api/docs/user">
          <a className="flex items-center px-4 py-2 text-neutral-600 hover:bg-neutral-50">
            <span className="material-icons mr-3">description</span>
            API Documentation
          </a>
        </Link>
        <Link href="/users">
          <a className={cn(
            "flex items-center px-4 py-2",
            location === "/users" 
              ? "text-primary-500 bg-primary-50 border-l-4 border-primary-500" 
              : "text-neutral-600 hover:bg-neutral-50"
          )}>
            <span className="material-icons mr-3">people</span>
            User Management
          </a>
        </Link>
        <Link href="/messaging">
          <a className={cn(
            "flex items-center px-4 py-2",
            location === "/messaging" 
              ? "text-primary-500 bg-primary-50 border-l-4 border-primary-500" 
              : "text-neutral-600 hover:bg-neutral-50"
          )}>
            <span className="material-icons mr-3">chat</span>
            Messaging
          </a>
        </Link>
        <Link href="/groups">
          <a className={cn(
            "flex items-center px-4 py-2",
            location === "/groups" 
              ? "text-primary-500 bg-primary-50 border-l-4 border-primary-500" 
              : "text-neutral-600 hover:bg-neutral-50"
          )}>
            <span className="material-icons mr-3">group_work</span>
            Groups
          </a>
        </Link>
        
        {isAdmin && (
          <>
            <div className="px-4 mt-6 mb-2 text-xs font-medium text-neutral-500 uppercase">Administration</div>
            <Link href="/admin-management">
              <a className={cn(
                "flex items-center px-4 py-2",
                location === "/admin-management" 
                  ? "text-primary-500 bg-primary-50 border-l-4 border-primary-500" 
                  : "text-neutral-600 hover:bg-neutral-50"
              )}>
                <span className="material-icons mr-3">admin_panel_settings</span>
                Admin Management
              </a>
            </Link>
            <Link href="/logs">
              <a className={cn(
                "flex items-center px-4 py-2",
                location === "/logs" 
                  ? "text-primary-500 bg-primary-50 border-l-4 border-primary-500" 
                  : "text-neutral-600 hover:bg-neutral-50"
              )}>
                <span className="material-icons mr-3">receipt_long</span>
                Logs
              </a>
            </Link>
            <Link href="/api/docs/admin">
              <a className="flex items-center px-4 py-2 text-neutral-600 hover:bg-neutral-50">
                <span className="material-icons mr-3">security</span>
                Admin API Docs
              </a>
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
