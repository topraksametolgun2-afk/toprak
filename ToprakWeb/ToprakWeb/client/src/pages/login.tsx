import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2, Building, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

type LoginData = z.infer<typeof loginSchema>;

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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Giriş başarısız");
      return response.json();
    },
    onSuccess: (data) => {
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

  const demoLogin = (email: string, password: string) => {
    form.setValue("email", email);
    form.setValue("password", password);
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-4xl flex">
        {/* Left Side - Login Form */}
        <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-600 rounded-full">
                <Building className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
              Toprak Platform
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
              Hesabınıza giriş yapın
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">E-posta Adresi</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="ornek@firma.com"
                          {...field}
                          data-testid="input-email"
                          className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
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
                      <FormLabel className="text-gray-700 dark:text-gray-300">Şifre</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            data-testid="input-password"
                            className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 pr-12"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            data-testid="button-toggle-password"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
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
                    <label htmlFor="remember-me" className="text-sm text-gray-700 dark:text-gray-300">
                      Beni hatırla
                    </label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                    Şifremi unuttum
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  disabled={loginMutation.isPending}
                  data-testid="button-submit"
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

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Hesabınız yok mu?{" "}
                <Link 
                  href="/register" 
                  className="font-medium text-blue-600 hover:text-blue-700"
                  data-testid="link-register"
                >
                  Kayıt olun
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Demo Users */}
        <div className="hidden lg:block w-96 ml-8">
          <Card className="bg-white dark:bg-gray-800 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Demo Hesaplar
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Test için kullanabileceğiniz örnek hesaplar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Admin Demo */}
              <div className="border rounded-lg p-4 border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    A
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Admin</h4>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">ADMIN</span>
                  </div>
                </div>
                <div className="text-sm space-y-1 mb-3">
                  <p className="text-gray-600 dark:text-gray-400"><strong>E-posta:</strong> admin@example.com</p>
                  <p className="text-gray-600 dark:text-gray-400"><strong>Şifre:</strong> 123456</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => demoLogin("admin@example.com", "123456")}
                  disabled={loginMutation.isPending}
                  data-testid="button-demo-admin"
                >
                  Admin olarak giriş yap
                </Button>
              </div>

              {/* Seller Demo */}
              <div className="border rounded-lg p-4 border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    AY
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Ayşe Yılmaz</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">SELLER</span>
                  </div>
                </div>
                <div className="text-sm space-y-1 mb-3">
                  <p className="text-gray-600 dark:text-gray-400"><strong>E-posta:</strong> ayse@firma.com</p>
                  <p className="text-gray-600 dark:text-gray-400"><strong>Şifre:</strong> 123456</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => demoLogin("ayse@firma.com", "123456")}
                  disabled={loginMutation.isPending}
                  data-testid="button-demo-seller"
                >
                  Satıcı olarak giriş yap
                </Button>
              </div>

              {/* Buyer Demo */}
              <div className="border rounded-lg p-4 border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    MK
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Mehmet Kaya</h4>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">BUYER</span>
                  </div>
                </div>
                <div className="text-sm space-y-1 mb-3">
                  <p className="text-gray-600 dark:text-gray-400"><strong>E-posta:</strong> mehmet@firma.com</p>
                  <p className="text-gray-600 dark:text-gray-400"><strong>Şifre:</strong> 123456</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => demoLogin("mehmet@firma.com", "123456")}
                  disabled={loginMutation.isPending}
                  data-testid="button-demo-buyer"
                >
                  Alıcı olarak giriş yap
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}