import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import TicketsPage from "@/pages/tickets";
import AdminPage from "@/pages/admin";
import ProductsPage from "@/pages/products";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={TicketsPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/products" component={ProductsPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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
