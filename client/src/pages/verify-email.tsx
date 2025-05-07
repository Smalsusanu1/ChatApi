import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { VerifyEmailComponent } from "@/components/auth/verify-email";

export default function VerifyEmail() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="material-icons text-white">mail</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold">Email Verification</h1>
          <p className="mt-2 text-neutral-500">Please verify your email address to continue</p>
        </div>
        
        <VerifyEmailComponent />
      </div>
    </div>
  );
}
