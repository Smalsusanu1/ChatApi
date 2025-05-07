import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Register from "@/pages/register";
import VerifyEmail from "@/pages/verify-email";
import Messaging from "@/pages/messaging";
import Groups from "@/pages/groups";
import UserManagement from "@/pages/user-management";
import AdminManagement from "@/pages/admin-management";
import Logs from "@/pages/logs";
import { useAuth } from "./hooks/use-auth";
import { AuthProvider } from "./context/auth-context";

function Router() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/verify-email/:token" component={VerifyEmail} />
      
      {/* Protected routes */}
      {isAuthenticated ? (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/messaging" component={Messaging} />
          <Route path="/groups" component={Groups} />
          <Route path="/users" component={UserManagement} />
          
          {/* Admin-only routes */}
          {isAdmin && (
            <>
              <Route path="/admin-management" component={AdminManagement} />
              <Route path="/logs" component={Logs} />
            </>
          )}
        </>
      ) : (
        <Route path="/" component={Login} />
      )}
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthenticatedApp />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
