import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export function VerifyEmailComponent() {
  const { token } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError("Invalid verification token");
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiRequest("GET", `/api/v1/auth/verify/${token}`);
        const result = await response.json();
        
        if (result.success) {
          setIsVerified(true);
          toast({
            title: "Email verified",
            description: "Your email has been verified successfully.",
            variant: "default",
          });
        } else {
          setError(result.message || "Failed to verify email");
        }
      } catch (error: any) {
        setError(error.message || "Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, toast]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
        <CardDescription>Verifying your email address</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6">
        {isLoading ? (
          <>
            <Loader2 className="h-16 w-16 animate-spin mb-4 text-primary" />
            <p>Verifying your email address...</p>
          </>
        ) : isVerified ? (
          <>
            <CheckCircle className="h-16 w-16 mb-4 text-success" />
            <p className="text-center mb-4">Your email has been verified successfully!</p>
            <p className="text-center text-muted-foreground">You can now login to your account.</p>
          </>
        ) : (
          <>
            <XCircle className="h-16 w-16 mb-4 text-destructive" />
            <p className="text-center mb-4">Failed to verify your email.</p>
            <p className="text-center text-muted-foreground">{error || "The verification link may be expired or invalid."}</p>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={() => window.location.href = "/login"}>
          Go to Login
        </Button>
      </CardFooter>
    </Card>
  );
}

export default VerifyEmailComponent;
