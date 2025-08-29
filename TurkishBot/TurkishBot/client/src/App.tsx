import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { authManager } from "./lib/auth";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/layout/navbar";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import SettingsPage from "@/pages/settings";
import DashboardPage from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import { User } from "@shared/schema";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      setLocation("/login");
    }
  }, [setLocation]);

  if (!authManager.isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (authManager.isAuthenticated()) {
      setLocation("/");
    }
  }, [setLocation]);

  if (authManager.isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
}

function Router() {
  const [user, setUser] = useState<User | null>(authManager.getUser());
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    authManager.logout();
    setUser(null);
    setLocation("/login");
  };

  // Update user state when auth changes
  useEffect(() => {
    const currentUser = authManager.getUser();
    setUser(currentUser);
  }, []);

  return (
    <>
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <Switch>
        <Route path="/login">
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        </Route>
        
        <Route path="/register">
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        </Route>
        
        <Route path="/settings">
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        </Route>
        
        <Route path="/">
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        </Route>
        
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
