import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "@/pages/dashboard";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import ToptanciDashboard from "@/pages/toptanci-dashboard";
import AliciDashboard from "@/pages/alici-dashboard";
import ProductsPage from "@/pages/products";
import OrdersPage from "@/pages/orders";
import NotFound from "@/pages/not-found";

function AuthRouter() {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login">
        {user ? (
          userRole === 'Toptancı' ? <Redirect to="/toptanci-dashboard" /> :
          userRole === 'Alıcı' ? <Redirect to="/alici-dashboard" /> :
          <Redirect to="/" />
        ) : (
          <LoginPage />
        )}
      </Route>
      
      <Route path="/register">
        {user ? (
          userRole === 'Toptancı' ? <Redirect to="/toptanci-dashboard" /> :
          userRole === 'Alıcı' ? <Redirect to="/alici-dashboard" /> :
          <Redirect to="/" />
        ) : (
          <RegisterPage />
        )}
      </Route>

      <Route path="/toptanci-dashboard">
        <ProtectedRoute requiredRole="Toptancı">
          <ToptanciDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/alici-dashboard">
        <ProtectedRoute requiredRole="Alıcı">
          <AliciDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/products">
        <ProtectedRoute>
          <ProductsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/orders">
        <ProtectedRoute>
          <OrdersPage />
        </ProtectedRoute>
      </Route>

      <Route path="/">
        {user ? (
          userRole === 'Toptancı' ? <Redirect to="/toptanci-dashboard" /> :
          userRole === 'Alıcı' ? <Redirect to="/alici-dashboard" /> :
          <Dashboard />
        ) : (
          <Redirect to="/login" />
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AuthRouter />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
