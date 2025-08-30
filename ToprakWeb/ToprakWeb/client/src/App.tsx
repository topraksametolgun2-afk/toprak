import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Register from "@/pages/register";
import AdminPanel from "@/pages/admin-panel";
import DestekMerkezi from "@/pages/destek-merkezi";
import SupportCenter from "@/pages/support-center";
import StokYonetimi from "@/pages/stok-yonetimi";
import UrunArama from "@/pages/urun-arama";
import TurkishBot from "@/pages/turkish-bot";
import TicketSistemi from "@/pages/ticket-sistemi";
import Ayarlar from "@/pages/ayarlar";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/destek-merkezi" component={DestekMerkezi} />
      <Route path="/support-center" component={SupportCenter} />
      <Route path="/stok-yonetimi" component={StokYonetimi} />
      <Route path="/urun-arama" component={UrunArama} />
      <Route path="/turkish-bot" component={TurkishBot} />
      <Route path="/ticket-sistemi" component={TicketSistemi} />
      <Route path="/ayarlar" component={Ayarlar} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
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
