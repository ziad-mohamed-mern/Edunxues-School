import UniversalUserForm from "@/components/auth/UniversalUserForm";
import { useAuth } from "@/hooks/AuthProvider";
import { School } from "lucide-react";
import { Link, Navigate } from "react-router";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const Login = () => {
  const { user, loading } = useAuth();
  if (user && !loading) {
    return <Navigate to="/dashboard" />;
  }
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <School className="size-4" />
            </div>
            Edunexus.
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center relative">
          <div className="w-full max-w-sm space-y-6">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Login to Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to access your account
              </p>
            </div>
            
            <Alert variant="default" className="bg-blue-50/50 text-blue-900 border-blue-200 dark:bg-blue-950/50 dark:text-blue-200 dark:border-blue-900">
              <Info className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <span className="block font-medium mb-1">Demo Credentials:</span>
                Email: <strong>admin@edunexus.com</strong><br/>
                Password: <strong>password123</strong>
              </AlertDescription>
            </Alert>

            <UniversalUserForm type="login" />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1610962381137-50ef93055125"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default Login;
