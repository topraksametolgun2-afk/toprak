import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";
import HelpCenter from "@/pages/help-center";
import AdminPanel from "@/pages/admin-panel";
import Settings from "@/pages/settings";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";

function LoginForm() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await authService.login(credentials.username, credentials.password);
        toast({
          title: "Başarılı",
          description: "Giriş yapıldı!",
        });
      } else {
        await authService.register(credentials);
        toast({
          title: "Başarılı",
          description: "Hesap oluşturuldu! Şimdi giriş yapabilirsiniz.",
        });
        setIsLogin(true);
      }
      window.location.reload(); // Reload to trigger re-render
    } catch (error) {
      toast({
        title: "Hata",
        description: isLogin ? "Giriş yapılamadı. Bilgilerinizi kontrol edin." : "Hesap oluşturulamadı.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {isLogin ? "Giriş Yap" : "Hesap Oluştur"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                required
                data-testid="input-username"
              />
            </div>
            <div>
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                required
                data-testid="input-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-submit">
              {isLoading ? "İşleniyor..." : (isLogin ? "Giriş Yap" : "Hesap Oluştur")}
            </Button>
            <div className="text-center">
              <Button 
                type="button" 
                variant="link" 
                onClick={() => setIsLogin(!isLogin)}
                data-testid="button-toggle-mode"
              >
                {isLogin ? "Hesap oluştur" : "Giriş yap"}
              </Button>
            </div>
          </form>
          <div className="mt-4 p-3 bg-muted rounded text-sm">
            <p><strong>Test Hesapları:</strong></p>
            <p>Admin: admin / admin123</p>
            <p>Kullanıcı: ahmet / 123456</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Router() {
  const user = authService.getUser();

  if (!user) {
    return <LoginForm />;
  }

  return (
    <Switch>
      <Route path="/" component={Products} />
      <Route path="/urunler" component={Products} />
      <Route path="/urunler/:id" component={ProductDetail} />
      <Route path="/help-center" component={HelpCenter} />
      <Route path="/admin-panel" component={AdminPanel} />
      <Route path="/ayarlar" component={Settings} />
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
