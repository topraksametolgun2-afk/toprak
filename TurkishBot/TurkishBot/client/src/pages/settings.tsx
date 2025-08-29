import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  updateProfileSchema, 
  updatePasswordSchema, 
  updatePreferencesSchema,
  type UpdateProfile,
  type UpdatePassword,
  type UpdatePreferences,
  type User 
} from "@shared/schema";
import { apiGet, apiPut } from "@/lib/api";
import { authManager } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, EyeOff, Loader2, User as UserIcon, Lock, Bell, Camera, Upload, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export default function SettingsPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userData, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: () => apiGet<{ user: User }>("/api/auth/me"),
  });

  const user = userData?.user;

  // Profile form
  const profileForm = useForm<UpdateProfile>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      phone: user?.phone || "",
      company: user?.company || "",
      avatar_url: user?.avatar_url || "",
    },
  });

  // Update profile form values when user data loads
  if (user && !profileForm.formState.isDirty) {
    profileForm.reset({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone: user.phone || "",
      company: user.company || "",
      avatar_url: user.avatar_url || "",
    });
  }

  // Password form
  const passwordFormSchema = updatePasswordSchema.extend({
    confirm_new_password: z.string().min(1, "Şifre tekrarı gereklidir"),
  }).refine((data) => data.new_password === data.confirm_new_password, {
    message: "Yeni şifreler eşleşmiyor",
    path: ["confirm_new_password"],
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_new_password: "",
    },
  });

  // Preferences form
  const preferencesForm = useForm<UpdatePreferences>({
    resolver: zodResolver(updatePreferencesSchema),
    defaultValues: {
      notify_email: user?.notify_email ?? true,
      notify_inapp: user?.notify_inapp ?? true,
    },
  });

  // Update preferences form values when user data loads
  if (user && !preferencesForm.formState.isDirty) {
    preferencesForm.reset({
      notify_email: user.notify_email,
      notify_inapp: user.notify_inapp,
    });
  }

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfile) => apiPut<{ user: User }>("/api/profile", data),
    onSuccess: (data) => {
      authManager.updateUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Profil güncellendi",
        description: "Profil bilgileriniz başarıyla güncellendi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Güncelleme başarısız",
        description: error.message || "Profil güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: UpdatePassword) => apiPut("/api/profile/password", data),
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: "Şifre güncellendi",
        description: "Şifreniz başarıyla değiştirildi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Şifre güncellenemedi",
        description: error.message || "Şifre güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: UpdatePreferences) => apiPut<{ user: User }>("/api/profile/preferences", data),
    onSuccess: (data) => {
      authManager.updateUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Tercihler güncellendi",
        description: "Bildirim tercihleriniz başarıyla güncellendi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Güncelleme başarısız",
        description: error.message || "Tercihler güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const getInitials = (firstName?: string, lastName?: string): string => {
    const first = firstName?.charAt(0)?.toUpperCase() || "";
    const last = lastName?.charAt(0)?.toUpperCase() || "";
    return first + last || "U";
  };

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case "ADMIN": return "Yönetici";
      case "SELLER": return "Satıcı";
      case "BUYER": return "Alıcı";
      default: return role;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "hsl(210, 40%, 98%)" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "hsl(221, 83%, 53%)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(210, 40%, 98%)" }}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: "hsl(222, 84%, 4.9%)" }}>Ayarlar</h1>
          <p className="mt-2" style={{ color: "hsl(215, 16%, 46.9%)" }}>Hesap bilgilerinizi ve tercihlerinizi yönetin</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4" style={{ backgroundColor: "hsl(0, 0%, 100%)", borderColor: "hsl(214, 32%, 91%)" }}>
            <TabsTrigger value="profile" className="flex items-center gap-2" data-testid="tab-profile">
              <UserIcon className="h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2" data-testid="tab-password">
              <Lock className="h-4 w-4" />
              Şifre
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2" data-testid="tab-notifications">
              <Bell className="h-4 w-4" />
              Bildirimler
            </TabsTrigger>
            <TabsTrigger value="avatar" className="flex items-center gap-2" data-testid="tab-avatar">
              <Camera className="h-4 w-4" />
              Fotoğraf
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card style={{ backgroundColor: "hsl(0, 0%, 100%)", borderColor: "hsl(214, 32%, 91%)" }}>
              <CardHeader>
                <CardTitle style={{ color: "hsl(222, 84%, 4.9%)" }}>Profil Bilgileri</CardTitle>
                <CardDescription style={{ color: "hsl(215, 16%, 46.9%)" }}>
                  Kişisel bilgilerinizi güncelleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: "hsl(222, 84%, 4.9%)" }}>Ad</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} data-testid="input-firstName" style={{ 
                                backgroundColor: "hsl(210, 40%, 98%)",
                                borderColor: "hsl(214, 32%, 91%)",
                                color: "hsl(222, 84%, 4.9%)"
                              }} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: "hsl(222, 84%, 4.9%)" }}>Soyad</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} data-testid="input-lastName" style={{ 
                                backgroundColor: "hsl(210, 40%, 98%)",
                                borderColor: "hsl(214, 32%, 91%)",
                                color: "hsl(222, 84%, 4.9%)"
                              }} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ color: "hsl(222, 84%, 4.9%)" }}>Telefon</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              placeholder="+90 5xx xxx xx xx"
                              data-testid="input-phone"
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
                      control={profileForm.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ color: "hsl(222, 84%, 4.9%)" }}>Şirket</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} data-testid="input-company" style={{ 
                              backgroundColor: "hsl(210, 40%, 98%)",
                              borderColor: "hsl(214, 32%, 91%)",
                              color: "hsl(222, 84%, 4.9%)"
                            }} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium" style={{ color: "hsl(222, 84%, 4.9%)" }}>E-posta Adresi</label>
                      <Input
                        value={user?.email || ""}
                        disabled
                        data-testid="input-email-disabled"
                        style={{ 
                          backgroundColor: "hsl(210, 40%, 96%)",
                          borderColor: "hsl(214, 32%, 91%)",
                          color: "hsl(215, 16%, 46.9%)"
                        }}
                      />
                      <p className="text-xs" style={{ color: "hsl(215, 16%, 46.9%)" }}>E-posta adresi değiştirilemez</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium" style={{ color: "hsl(222, 84%, 4.9%)" }}>Rol</label>
                      <Input
                        value={user ? getRoleLabel(user.role) : ""}
                        disabled
                        data-testid="input-role-disabled"
                        style={{ 
                          backgroundColor: "hsl(210, 40%, 96%)",
                          borderColor: "hsl(214, 32%, 91%)",
                          color: "hsl(215, 16%, 46.9%)"
                        }}
                      />
                      <p className="text-xs" style={{ color: "hsl(215, 16%, 46.9%)" }}>Rol değiştirilemez, destek ekibiyle iletişime geçin</p>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <Button 
                        type="submit" 
                        disabled={updateProfileMutation.isPending}
                        data-testid="button-save-profile"
                        style={{ 
                          backgroundColor: "hsl(221, 83%, 53%)", 
                          color: "hsl(210, 40%, 98%)" 
                        }}
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Kaydediliyor...
                          </>
                        ) : (
                          "Değişiklikleri Kaydet"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="mt-6">
            <Card style={{ backgroundColor: "hsl(0, 0%, 100%)", borderColor: "hsl(214, 32%, 91%)" }}>
              <CardHeader>
                <CardTitle style={{ color: "hsl(222, 84%, 4.9%)" }}>Şifre Değiştir</CardTitle>
                <CardDescription style={{ color: "hsl(215, 16%, 46.9%)" }}>
                  Hesabınızın güvenliği için güçlü bir şifre seçin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit((data) => {
                    const { confirm_new_password, ...updateData } = data;
                    updatePasswordMutation.mutate(updateData);
                  })} className="space-y-4 max-w-md">
                    <FormField
                      control={passwordForm.control}
                      name="current_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ color: "hsl(222, 84%, 4.9%)" }}>Mevcut Şifre</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
                                data-testid="input-currentPassword"
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
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                data-testid="button-toggle-currentPassword"
                              >
                                {showCurrentPassword ? (
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
                    
                    <FormField
                      control={passwordForm.control}
                      name="new_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ color: "hsl(222, 84%, 4.9%)" }}>Yeni Şifre</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
                                data-testid="input-newPassword"
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
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                data-testid="button-toggle-newPassword"
                              >
                                {showNewPassword ? (
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
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirm_new_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ color: "hsl(222, 84%, 4.9%)" }}>Yeni Şifre Tekrar</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
                                data-testid="input-confirmNewPassword"
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
                                data-testid="button-toggle-confirmNewPassword"
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
                    
                    <div className="flex justify-end pt-4">
                      <Button 
                        type="submit" 
                        disabled={updatePasswordMutation.isPending}
                        data-testid="button-save-password"
                        style={{ 
                          backgroundColor: "hsl(221, 83%, 53%)", 
                          color: "hsl(210, 40%, 98%)" 
                        }}
                      >
                        {updatePasswordMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Güncelleniyor...
                          </>
                        ) : (
                          "Şifreyi Güncelle"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card style={{ backgroundColor: "hsl(0, 0%, 100%)", borderColor: "hsl(214, 32%, 91%)" }}>
              <CardHeader>
                <CardTitle style={{ color: "hsl(222, 84%, 4.9%)" }}>Bildirim Ayarları</CardTitle>
                <CardDescription style={{ color: "hsl(215, 16%, 46.9%)" }}>
                  Hangi bildirimleri almak istediğinizi seçin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...preferencesForm}>
                  <form onSubmit={preferencesForm.handleSubmit((data) => updatePreferencesMutation.mutate(data))} className="space-y-6 max-w-md">
                    <FormField
                      control={preferencesForm.control}
                      name="notify_email"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4" style={{ borderColor: "hsl(214, 32%, 91%)" }}>
                          <div className="space-y-0.5">
                            <FormLabel className="text-base" style={{ color: "hsl(222, 84%, 4.9%)" }}>E-posta Bildirimleri</FormLabel>
                            <p className="text-sm" style={{ color: "hsl(215, 16%, 46.9%)" }}>
                              Önemli güncellemeler için e-posta alın
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-notifyEmail"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={preferencesForm.control}
                      name="notify_inapp"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4" style={{ borderColor: "hsl(214, 32%, 91%)" }}>
                          <div className="space-y-0.5">
                            <FormLabel className="text-base" style={{ color: "hsl(222, 84%, 4.9%)" }}>Uygulama İçi Bildirimler</FormLabel>
                            <p className="text-sm" style={{ color: "hsl(215, 16%, 46.9%)" }}>
                              Tarayıcı bildirimleri alın
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-notifyInapp"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end pt-4">
                      <Button 
                        type="submit" 
                        disabled={updatePreferencesMutation.isPending}
                        data-testid="button-save-preferences"
                        style={{ 
                          backgroundColor: "hsl(221, 83%, 53%)", 
                          color: "hsl(210, 40%, 98%)" 
                        }}
                      >
                        {updatePreferencesMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Kaydediliyor...
                          </>
                        ) : (
                          "Tercihleri Kaydet"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="avatar" className="mt-6">
            <Card style={{ backgroundColor: "hsl(0, 0%, 100%)", borderColor: "hsl(214, 32%, 91%)" }}>
              <CardHeader>
                <CardTitle style={{ color: "hsl(222, 84%, 4.9%)" }}>Profil Fotoğrafı</CardTitle>
                <CardDescription style={{ color: "hsl(215, 16%, 46.9%)" }}>
                  Profil fotoğrafınızı yükleyin veya kaldırın
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 max-w-md">
                  <div className="flex items-center space-x-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={user?.avatar_url || undefined} />
                      <AvatarFallback className="text-2xl font-bold" style={{ backgroundColor: "hsl(221, 83%, 53%)", color: "hsl(210, 40%, 98%)" }}>
                        {getInitials(user?.first_name || undefined, user?.last_name || undefined)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm font-medium" style={{ color: "hsl(222, 84%, 4.9%)" }}>Mevcut Fotoğraf</h4>
                      <p className="text-xs" style={{ color: "hsl(215, 16%, 46.9%)" }}>JPG, PNG veya GIF formatında olmalı</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "hsl(222, 84%, 4.9%)" }}>
                      Yeni Fotoğraf Yükle
                    </label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer" style={{ borderColor: "hsl(214, 32%, 91%)" }}>
                      <input 
                        type="file" 
                        accept="image/jpeg,image/png,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            toast({
                              title: "Fotoğraf seçildi",
                              description: "Kaydetmek için 'Fotoğrafı Kaydet' butonuna tıklayın.",
                            });
                          }
                        }}
                        data-testid="input-avatar-upload"
                      />
                      <Upload className="h-12 w-12 mb-2 mx-auto" style={{ color: "hsl(215, 16%, 46.9%)" }} />
                      <p className="text-sm font-medium" style={{ color: "hsl(222, 84%, 4.9%)" }}>Fotoğraf seçmek için tıklayın</p>
                      <p className="text-xs" style={{ color: "hsl(215, 16%, 46.9%)" }}>Maksimum 2MB</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button 
                      type="button" 
                      onClick={() => {
                        toast({
                          title: "Özellik geliştiriliyor",
                          description: "Avatar yükleme özelliği yakında eklenecek.",
                        });
                      }}
                      data-testid="button-save-avatar"
                      style={{ 
                        backgroundColor: "hsl(221, 83%, 53%)", 
                        color: "hsl(210, 40%, 98%)" 
                      }}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Fotoğrafı Kaydet
                    </Button>
                    <Button 
                      type="button" 
                      variant="destructive"
                      onClick={() => {
                        toast({
                          title: "Özellik geliştiriliyor",
                          description: "Avatar kaldırma özelliği yakında eklenecek.",
                        });
                      }}
                      data-testid="button-remove-avatar"
                      style={{ 
                        backgroundColor: "hsl(0, 84%, 60%)", 
                        color: "hsl(210, 40%, 98%)" 
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Fotoğrafı Kaldır
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
