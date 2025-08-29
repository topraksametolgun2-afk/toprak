import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Navigation } from "@/components/navigation";
import { authService } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { updateProfileSchema, updatePasswordSchema, updateNotificationSchema } from "@shared/schema";
import { ArrowLeft, Camera, User, Lock, Bell, Save } from "lucide-react";
import type { z } from "zod";

type UpdateProfile = z.infer<typeof updateProfileSchema>;
type UpdatePassword = z.infer<typeof updatePasswordSchema>;
type UpdateNotification = z.infer<typeof updateNotificationSchema>;

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Kullanıcı profilini getir
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/profile'],
    queryFn: async () => {
      const response = await fetch('/api/profile', {
        headers: authService.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Profil bilgileri alınamadı');
      return response.json();
    }
  });

  // Profil güncelleme formu
  const profileForm = useForm<UpdateProfile>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      companyName: "",
      profileImage: "",
    },
  });

  // Profil verisi geldiğinde form değerlerini güncelle
  if (profile && !profileForm.formState.isDirty) {
    profileForm.reset({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: profile.email || "",
      phone: profile.phone || "",
      companyName: profile.companyName || "",
      profileImage: profile.profileImage || "",
    });
  }

  // Şifre değiştirme formu
  const passwordForm = useForm<UpdatePassword>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Bildirim ayarları formu
  const notificationForm = useForm<UpdateNotification>({
    resolver: zodResolver(updateNotificationSchema),
    defaultValues: {
      emailNotifications: true,
      appNotifications: true,
    },
  });

  // Bildirim verisi geldiğinde form değerlerini güncelle
  if (profile && !notificationForm.formState.isDirty) {
    notificationForm.reset({
      emailNotifications: profile.emailNotifications ?? true,
      appNotifications: profile.appNotifications ?? true,
    });
  }

  // Profil güncelleme mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfile) => {
      const response = await apiRequest('PUT', '/api/profile', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Başarılı",
        description: "Profil bilgileriniz güncellendi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Profil bilgileri güncellenemedi",
        variant: "destructive",
      });
    },
  });

  // Şifre değiştirme mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: UpdatePassword) => {
      const response = await apiRequest('PUT', '/api/profile/password', data);
      return response.json();
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: "Başarılı",
        description: "Şifreniz güncellendi",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Şifre güncellenemedi",
        variant: "destructive",
      });
    },
  });

  // Bildirim ayarları mutation
  const updateNotificationMutation = useMutation({
    mutationFn: async (data: UpdateNotification) => {
      const response = await apiRequest('PUT', '/api/profile/notifications', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Başarılı",
        description: "Bildirim ayarlarınız güncellendi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Bildirim ayarları güncellenemedi",
        variant: "destructive",
      });
    },
  });

  // Profil fotoğrafı yükleme mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async ({ imageData, fileName }: { imageData: string; fileName: string }) => {
      const response = await apiRequest('POST', '/api/profile/avatar', { imageData, fileName });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Başarılı",
        description: "Profil fotoğrafınız güncellendi",
      });
      setIsUploadingImage(false);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Profil fotoğrafı yüklenemedi",
        variant: "destructive",
      });
      setIsUploadingImage(false);
    },
  });

  const onProfileSubmit = (data: UpdateProfile) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: UpdatePassword) => {
    updatePasswordMutation.mutate(data);
  };

  const onNotificationSubmit = (data: UpdateNotification) => {
    updateNotificationMutation.mutate(data);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Hata",
        description: "Dosya boyutu 2MB'den küçük olmalıdır",
        variant: "destructive",
      });
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Hata",
        description: "Sadece resim dosyaları yükleyebilirsiniz",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);
    
    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result as string;
      uploadAvatarMutation.mutate({ imageData, fileName: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Kullanıcı Ayarları</h1>
          <p className="text-muted-foreground mt-2">
            Profil bilgilerinizi yönetin ve hesap ayarlarınızı düzenleyin
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3" data-testid="tabs-settings">
            <TabsTrigger value="profile" data-testid="tab-profile">
              <User className="w-4 h-4 mr-2" />
              Profil Bilgileri
            </TabsTrigger>
            <TabsTrigger value="password" data-testid="tab-password">
              <Lock className="w-4 h-4 mr-2" />
              Şifre Değiştir
            </TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications">
              <Bell className="w-4 h-4 mr-2" />
              Bildirim Ayarları
            </TabsTrigger>
          </TabsList>

          {/* Profil Bilgileri Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profil Bilgileri</CardTitle>
                <CardDescription>
                  Kişisel bilgilerinizi buradan düzenleyebilirsiniz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    {/* Profil Fotoğrafı */}
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-20 h-20" data-testid="avatar-profile">
                        <AvatarImage src={profile?.profileImage} />
                        <AvatarFallback className="text-xl">
                          {profile?.firstName?.charAt(0) || profile?.username?.charAt(0) || 'K'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          data-testid="input-file-avatar"
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleChangePhotoClick}
                          disabled={isUploadingImage}
                          data-testid="button-change-photo"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          {isUploadingImage ? "Yükleniyor..." : "Fotoğraf Değiştir"}
                        </Button>
                        <p className="text-sm text-muted-foreground mt-1">
                          JPG, PNG formatında, maksimum 2MB
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ad</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-first-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Soyad</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-last-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-posta</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefon</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Firma Adı</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-company" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-save-profile"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateProfileMutation.isPending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Şifre Değiştir Tab */}
          <TabsContent value="password" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Şifre Değiştir</CardTitle>
                <CardDescription>
                  Hesabınızın güvenliği için düzenli olarak şifrenizi güncelleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mevcut Şifre</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} data-testid="input-current-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Yeni Şifre</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} data-testid="input-new-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Yeni Şifre Tekrar</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} data-testid="input-confirm-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={updatePasswordMutation.isPending}
                      data-testid="button-save-password"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updatePasswordMutation.isPending ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bildirim Ayarları Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bildirim Ayarları</CardTitle>
                <CardDescription>
                  Hangi bildirimleri almak istediğinizi seçin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">E-posta Bildirimleri</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Destek talepleriniz hakkında e-posta bildirimleri alın
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-email-notifications"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="appNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Uygulama İçi Bildirimler</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Uygulama içinde gerçek zamanlı bildirimler alın
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-app-notifications"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={updateNotificationMutation.isPending}
                      data-testid="button-save-notifications"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateNotificationMutation.isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}