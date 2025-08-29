import { authManager } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      setLocation("/login");
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const user = authManager.getUser();
      const userRole = user?.role;
      if (!userRole || !allowedRoles.includes(userRole)) {
        setLocation("/"); // Redirect to dashboard if no access
        return;
      }
    }
  }, [setLocation, allowedRoles]);

  if (!authManager.isAuthenticated()) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const user = authManager.getUser();
    const userRole = user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return null;
    }
  }

  return <>{children}</>;
}
