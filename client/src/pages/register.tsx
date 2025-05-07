import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { RegisterForm } from "@/components/auth/register-form";

export default function Register() {
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
            <span className="material-icons text-white">api</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold">Create Account</h1>
          <p className="mt-2 text-neutral-500">Sign up to get started with our API system</p>
        </div>
        
        <RegisterForm />
        
        <div className="mt-8 text-center text-sm text-neutral-500">
          <p>
            By signing up, you agree to our{" "}
            <a href="#" className="text-primary-500 hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-primary-500 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
