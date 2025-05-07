import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

type HeaderProps = {
  openSidebar: () => void;
};

export function Header({ openSidebar }: HeaderProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  // Format the page path for breadcrumb
  const getPageTitle = () => {
    switch (location) {
      case "/": return "Dashboard";
      case "/users": return "User Management";
      case "/messaging": return "Messaging";
      case "/groups": return "Groups";
      case "/admin-management": return "Admin Management";
      case "/logs": return "System Logs";
      default: return "Page";
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <button className="md:hidden" onClick={openSidebar}>
          <span className="material-icons">menu</span>
        </button>
        <div className="flex items-center ml-auto">
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <span className="material-icons">notifications</span>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span className="text-sm">New message received</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="text-sm">Email verified successfully</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span className="text-sm">View all notifications</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="relative ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center p-2 rounded-full">
                  <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-white">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:block ml-2 mr-1">{user?.name || 'User'}</span>
                  <span className="material-icons text-sm">arrow_drop_down</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span className="material-icons mr-2 text-sm">person</span>
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="material-icons mr-2 text-sm">settings</span>
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <span className="material-icons mr-2 text-sm">logout</span>
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="flex items-center px-4 py-2 bg-neutral-50 border-t border-b text-sm">
        <span className="text-neutral-500">Dashboard</span>
        <span className="material-icons text-neutral-400 mx-1 text-xs">chevron_right</span>
        <span className="text-neutral-800">{getPageTitle()}</span>
      </div>
    </header>
  );
}

export default Header;
