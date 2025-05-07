import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import StatusCards from "@/components/dashboard/status-cards";
import ApiDocumentationCard from "@/components/dashboard/api-documentation-card";
import SystemHealthCard from "@/components/dashboard/system-health-card";
import ApiDocumentationTabs from "@/components/dashboard/api-documentation-tabs";

export default function Dashboard() {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar 
        mobile={!showMobileSidebar} 
        onClose={() => setShowMobileSidebar(false)} 
      />
      
      <main className="flex-1 overflow-x-hidden bg-neutral-50">
        <Header openSidebar={() => setShowMobileSidebar(true)} />
        
        <div className="p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-medium text-neutral-800">Dashboard</h1>
            <p className="text-neutral-500 mt-1">API system overview and management</p>
          </div>
          
          <StatusCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ApiDocumentationCard />
            <SystemHealthCard />
          </div>
          
          <ApiDocumentationTabs />
          
          {/* Footer */}
          <div className="mt-8 mb-4 pt-4 border-t">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-neutral-500 text-sm mb-2 md:mb-0">
                &copy; {new Date().getFullYear()} API Management System. All rights reserved.
              </div>
              <div className="flex space-x-4">
                <a href="/api/docs/user" className="text-neutral-500 hover:text-primary-500 text-sm">Documentation</a>
                <a href="#" className="text-neutral-500 hover:text-primary-500 text-sm">Support</a>
                <a href="#" className="text-neutral-500 hover:text-primary-500 text-sm">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
