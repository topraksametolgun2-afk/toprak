import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { User, Camera, Bell, Lock, Save } from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(2, "Ad en az 2 karakter olmalı"),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  phone: z.string().min(10, "Telefon numarası en az 10 haneli olmalı"),
  company: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Mevcut şifre gerekli"),
  newPassword: z.string().min(6, "Yeni şifre en az 6 karakter olmalı"),
  confirmPassword: z.string().min(6, "Şifre tekrarı gerekli"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  orderUpdates: z.boolean(),
  promotions: z.boolean(),
  stockAlerts: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type NotificationFormData = z.infer<typeof notificationSchema>;

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "05551234567",
      company: "ABC Şirketi",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const notificationForm = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      orderUpdates: true,
      promotions: false,
      stockAlerts: true,
    },
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      // API call would go here
      toast({
        title: "Profil güncellendi",
        description: "Profil bilgileriniz başarıyla kaydedildi.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Profil güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      // API call would go here
      toast({
        title: "Şifre güncellendi",
        description: "Şifreniz başarıyla değiştirildi.",
      });
      passwordForm.reset();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Şifre değiştirilirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const onNotificationSubmit = async (data: NotificationFormData) => {
    try {
      // API call would go here
      toast({
        title: "Bildirim ayarları güncellendi",
        description: "Bildirim tercihleriniz kaydedildi.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bildirim ayarları güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kullanıcı Ayarları</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Hesap bilgilerinizi ve tercihlerinizi yönetin
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                    activeTab === "profile" 
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  data-testid="tab-profile"
                >
                  <User className="h-4 w-4" />
                  Profil Bilgileri
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                    activeTab === "password" 
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  data-testid="tab-password"
                >
                  <Lock className="h-4 w-4" />
                  Şifre Değiştir
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                    activeTab === "notifications" 
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  data-testid="tab-notifications"
                >
                  <Bell className="h-4 w-4" />
                  Bildirimler
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profil Bilgileri
                </CardTitle>
                <CardDescription>
                  Kişisel bilgilerinizi güncelleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Label>Profil Fotoğrafı</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/placeholder-avatar.jpg" alt="Profil fotoğrafı" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm" data-testid="button-upload-photo">
                      <Camera className="h-4 w-4 mr-2" />
                      Fotoğraf Yükle
                    </Button>
                  </div>
                </div>

                <Separator className="my-6" />

                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ad</FormLabel>
                            <FormControl>
                              <Input placeholder="Adınız" {...field} data-testid="input-firstName" />
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
                              <Input placeholder="Soyadınız" {...field} data-testid="input-lastName" />
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
                            <Input type="email" placeholder="email@example.com" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon</FormLabel>
                          <FormControl>
                            <Input placeholder="05551234567" {...field} data-testid="input-phone" />
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
                          <FormLabel>Firma (Opsiyonel)</FormLabel>
                          <FormControl>
                            <Input placeholder="Firma adı" {...field} data-testid="input-company" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full md:w-auto" data-testid="button-save-profile">
                      <Save className="h-4 w-4 mr-2" />
                      Profili Kaydet
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {activeTab === "password" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Şifre Değiştir
                </CardTitle>
                <CardDescription>
                  Hesabınızın güvenliği için güçlü bir şifre kullanın
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mevcut Şifre</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Mevcut şifreniz" {...field} data-testid="input-currentPassword" />
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
                            <Input type="password" placeholder="Yeni şifreniz" {...field} data-testid="input-newPassword" />
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
                          <FormLabel>Şifre Tekrarı</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Yeni şifrenizi tekrar girin" {...field} data-testid="input-confirmPassword" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full md:w-auto" data-testid="button-change-password">
                      <Save className="h-4 w-4 mr-2" />
                      Şifreyi Değiştir
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Bildirim Ayarları
                </CardTitle>
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
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">E-posta Bildirimleri</FormLabel>
                            <FormDescription>
                              Önemli güncellemeler için e-posta bildirimleri alın
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-emailNotifications"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="orderUpdates"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Sipariş Güncellemeleri</FormLabel>
                            <FormDescription>
                              Sipariş durumu değişikliklerinde bilgilendirilme
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-orderUpdates"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="promotions"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Promosyonlar</FormLabel>
                            <FormDescription>
                              Özel indirimler ve kampanyalar hakkında bilgi alın
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-promotions"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="stockAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Stok Uyarıları</FormLabel>
                            <FormDescription>
                              Düşük stok seviyeleri hakkında bilgilendirilme
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-stockAlerts"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full md:w-auto" data-testid="button-save-notifications">
                      <Save className="h-4 w-4 mr-2" />
                      Bildirimleri Kaydet
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}