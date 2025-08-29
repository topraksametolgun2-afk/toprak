import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const registerFormSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Şifre tekrarı gereklidir"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      first_name: "",
      last_name: "",
      company: "",
      role: "BUYER",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      return apiPost<{ user: any; token: string }>("/api/auth/register", data);
    },
    onSuccess: () => {
      toast({
        title: "Kayıt başarılı!",
        description: "Hoş geldiniz. Giriş sayfasına yönlendiriliyorsunuz...",
      });
      setTimeout(() => {
        setLocation("/login");
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Kayıt başarısız",
        description: error.message || "Bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "hsl(210, 40%, 98%)" }}>
      <Card className="w-full max-w-md" style={{ backgroundColor: "hsl(0, 0%, 100%)", borderColor: "hsl(214, 32%, 91%)" }}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold" style={{ color: "hsl(222, 84%, 4.9%)" }}>Kayıt Ol</CardTitle>
          <CardDescription style={{ color: "hsl(215, 16%, 46.9%)" }}>
            Yeni hesap oluşturun
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "hsl(222, 84%, 4.9%)" }}>Ad</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ayşe"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-firstName"
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
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "hsl(222, 84%, 4.9%)" }}>Soyad</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Yılmaz"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-lastName"
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
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "hsl(222, 84%, 4.9%)" }}>E-posta Adresi</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="ayse@firma.com"
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
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "hsl(222, 84%, 4.9%)" }}>Şirket</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ABC Şirketi"
                        {...field}
                        value={field.value || ""}
                        data-testid="input-company"
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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "hsl(222, 84%, 4.9%)" }}>Rol</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-role" style={{ 
                          backgroundColor: "hsl(210, 40%, 98%)",
                          borderColor: "hsl(214, 32%, 91%)",
                          color: "hsl(222, 84%, 4.9%)"
                        }}>
                          <SelectValue placeholder="Rol seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BUYER">Alıcı</SelectItem>
                        <SelectItem value="SELLER">Satıcı</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <p className="text-xs" style={{ color: "hsl(215, 16%, 46.9%)" }}>En az 6 karakter olmalıdır</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "hsl(222, 84%, 4.9%)" }}>Şifre Tekrar</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          data-testid="input-confirmPassword"
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
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          data-testid="button-toggle-confirmPassword"
                        >
                          {showConfirmPassword ? (
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
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={registerMutation.isPending}
                data-testid="button-submit"
                style={{ 
                  backgroundColor: "hsl(221, 83%, 53%)", 
                  color: "hsl(210, 40%, 98%)" 
                }}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kayıt olunuyor...
                  </>
                ) : (
                  "Kayıt Ol"
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: "hsl(215, 16%, 46.9%)" }}>
              Zaten hesabınız var mı?{" "}
              <Link href="/login" className="font-medium transition-colors" style={{ color: "hsl(221, 83%, 53%)" }} data-testid="link-login">
                Giriş yapın
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
