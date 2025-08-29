import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { loginSchema, type LoginData } from "@shared/schema";
import { apiPost } from "@/lib/api";
import { authManager } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      return apiPost<{ user: any; token: string }>("/api/auth/login", data);
    },
    onSuccess: (data) => {
      authManager.login(data.user, data.token);
      toast({
        title: "Giriş başarılı!",
        description: "Hoş geldiniz.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Giriş başarısız",
        description: error.message || "Bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "hsl(210, 40%, 98%)" }}>
      <Card className="w-full max-w-md" style={{ backgroundColor: "hsl(0, 0%, 100%)", borderColor: "hsl(214, 32%, 91%)" }}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold" style={{ color: "hsl(222, 84%, 4.9%)" }}>Giriş Yap</CardTitle>
          <CardDescription style={{ color: "hsl(215, 16%, 46.9%)" }}>
            Hesabınıza giriş yapın
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "hsl(222, 84%, 4.9%)" }}>E-posta Adresi</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="ornek@firma.com"
                        {...field}
                        data-testid="input-email"
                        style={{ 
                          backgroundColor: "hsl(210, 40%, 98%)",
                          borderColor: "hsl(214, 32%, 91%)",
                          color: "hsl(222, 84%, 4.9%)"
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "hsl(222, 84%, 4.9%)" }}>Şifre</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          data-testid="input-password"
                          style={{ 
                            backgroundColor: "hsl(210, 40%, 98%)",
                            borderColor: "hsl(214, 32%, 91%)",
                            color: "hsl(222, 84%, 4.9%)"
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" style={{ color: "hsl(215, 16%, 46.9%)" }} />
                          ) : (
                            <Eye className="h-4 w-4" style={{ color: "hsl(215, 16%, 46.9%)" }} />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember-me" />
                  <Label htmlFor="remember-me" className="text-sm" style={{ color: "hsl(222, 84%, 4.9%)" }}>
                    Beni hatırla
                  </Label>
                </div>
                <Link href="/forgot-password" className="text-sm transition-colors" style={{ color: "hsl(221, 83%, 53%)" }}>
                  Şifremi unuttum
                </Link>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-submit"
                style={{ 
                  backgroundColor: "hsl(221, 83%, 53%)", 
                  color: "hsl(210, 40%, 98%)" 
                }}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  "Giriş Yap"
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: "hsl(215, 16%, 46.9%)" }}>
              Hesabınız yok mu?{" "}
              <Link href="/register" className="font-medium transition-colors" style={{ color: "hsl(221, 83%, 53%)" }} data-testid="link-register">
                Kayıt olun
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
