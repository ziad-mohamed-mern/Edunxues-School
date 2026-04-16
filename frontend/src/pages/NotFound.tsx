import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { MoveLeft, Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="relative">
        <h1 className="text-9xl font-bold text-muted-foreground/20">404</h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-2xl font-semibold bg-background px-4">Page Not Found</p>
        </div>
      </div>
      
      <p className="mt-8 text-muted-foreground max-w-md">
        Oops! The page you're looking for doesn't exist or has been moved. 
        Let's get you back on track.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Button asChild variant="outline">
          <Link to={-1 as any}>
            <MoveLeft className="mr-2 h-4 w-4" />
            Go Back
          </Link>
        </Button>
        <Button asChild>
          <Link to="/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
