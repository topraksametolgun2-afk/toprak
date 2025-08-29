import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import NotFound from "@/pages/not-found";
import ProductsPage from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Settings from "@/pages/settings";
import Admin from "@/pages/admin";
import Support from "@/pages/support";
import Inventory from "@/pages/inventory";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ProductsPage} />
      <Route path="/urunler" component={ProductsPage} />
      <Route path="/urun/:id" component={ProductDetail} />
      <Route path="/ayarlar" component={Settings} />
      <Route path="/admin" component={Admin} />
      <Route path="/destek" component={Support} />
      <Route path="/stok" component={Inventory} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navigation />
          <main className="pb-8">
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
