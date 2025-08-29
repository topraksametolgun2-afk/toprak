import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiGet } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Users, 
  Shield, 
  UserCheck, 
  Settings, 
  Mail, 
  Building,
  Phone,
  Calendar,
  Loader2 
} from "lucide-react";

export default function DashboardPage() {
  const { data: userData, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: () => apiGet<{ user: User }>("/api/auth/me"),
  });

  const user = userData?.user;

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case "ADMIN": return "Yönetici";
      case "SELLER": return "Satıcı";
      case "BUYER": return "Alıcı";
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case "ADMIN": return "bg-red-100 text-red-800";
      case "SELLER": return "bg-blue-100 text-blue-800";
      case "BUYER": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: "hsl(222, 84%, 4.9%)" }}>
            <Users className="inline mr-3" size={32} style={{ color: "hsl(221, 83%, 53%)" }} />
            Hoş Geldiniz!
          </h1>
          <p className="text-xl mb-8" style={{ color: "hsl(215, 16%, 46.9%)" }}>
            {user ? `Merhaba ${user.first_name || 'Kullanıcı'}!` : 'Kullanıcı Yönetim Sistemi'}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/settings">
              <Button 
                size="lg"
                style={{ 
                  backgroundColor: "hsl(221, 83%, 53%)", 
                  color: "hsl(210, 40%, 98%)" 
                }}
                data-testid="button-settings"
              >
                <Settings className="mr-2 h-5 w-5" />
                Ayarları Düzenle
              </Button>
            </Link>
          </div>
        </div>

        {/* User Info Cards */}
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Profile Info */}
            <Card style={{ backgroundColor: "hsl(0, 0%, 100%)", borderColor: "hsl(214, 32%, 91%)" }}>
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: "hsl(222, 84%, 4.9%)" }}>
                  <UserCheck className="mr-2 h-5 w-5" style={{ color: "hsl(221, 83%, 53%)" }} />
                  Profil Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm" style={{ color: "hsl(215, 16%, 46.9%)" }}>Ad Soyad</p>
                  <p className="font-medium" style={{ color: "hsl(222, 84%, 4.9%)" }} data-testid="text-user-fullname">
                    {user.first_name} {user.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "hsl(215, 16%, 46.9%)" }}>Rol</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(user.role)}`} data-testid="text-user-role">
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card style={{ backgroundColor: "hsl(0, 0%, 100%)", borderColor: "hsl(214, 32%, 91%)" }}>
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: "hsl(222, 84%, 4.9%)" }}>
                  <Mail className="mr-2 h-5 w-5" style={{ color: "hsl(221, 83%, 53%)" }} />
                  İletişim Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm" style={{ color: "hsl(215, 16%, 46.9%)" }}>E-posta</p>
                  <p className="font-medium" style={{ color: "hsl(222, 84%, 4.9%)" }} data-testid="text-user-email">
                    {user.email}
                  </p>
                </div>
                {user.phone && (
                  <div>
                    <p className="text-sm" style={{ color: "hsl(215, 16%, 46.9%)" }}>Telefon</p>
                    <p className="font-medium" style={{ color: "hsl(222, 84%, 4.9%)" }} data-testid="text-user-phone">
                      {user.phone}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company & Account Info */}
            <Card style={{ backgroundColor: "hsl(0, 0%, 100%)", borderColor: "hsl(214, 32%, 91%)" }}>
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: "hsl(222, 84%, 4.9%)" }}>
                  <Building className="mr-2 h-5 w-5" style={{ color: "hsl(221, 83%, 53%)" }} />
                  Hesap Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm" style={{ color: "hsl(215, 16%, 46.9%)" }}>Şirket</p>
                  <p className="font-medium" style={{ color: "hsl(222, 84%, 4.9%)" }} data-testid="text-user-company">
                    {user.company || 'Belirtilmemiş'}
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "hsl(215, 16%, 46.9%)" }}>Kayıt Tarihi</p>
                  <p className="font-medium flex items-center" style={{ color: "hsl(222, 84%, 4.9%)" }} data-testid="text-user-created">
                    <Calendar className="mr-1 h-4 w-4" style={{ color: "hsl(215, 16%, 46.9%)" }} />
                    {formatDate(user.created_at.toISOString())}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card style={{ backgroundColor: "hsl(0, 0%, 100%)", borderColor: "hsl(214, 32%, 91%)" }}>
            <CardHeader>
              <CardTitle className="flex items-center" style={{ color: "hsl(222, 84%, 4.9%)" }}>
                <Shield className="mr-2 h-6 w-6" style={{ color: "hsl(221, 83%, 53%)" }} />
                Güvenli Kimlik Doğrulama
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ color: "hsl(215, 16%, 46.9%)" }}>
                JWT tabanlı kimlik doğrulama ve bcrypt ile şifrelenmiş güvenli parola saklama
              </p>
            </CardContent>
          </Card>
          
          <Card style={{ backgroundColor: "hsl(0, 0%, 100%)", borderColor: "hsl(214, 32%, 91%)" }}>
            <CardHeader>
              <CardTitle className="flex items-center" style={{ color: "hsl(222, 84%, 4.9%)" }}>
                <Settings className="mr-2 h-6 w-6" style={{ color: "hsl(221, 83%, 53%)" }} />
                Profil Yönetimi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ color: "hsl(215, 16%, 46.9%)" }}>
                Kişisel bilgiler, şifre değiştirme ve bildirim ayarlarını yönetme
              </p>
            </CardContent>
          </Card>
          
          <Card style={{ backgroundColor: "hsl(0, 0%, 100%)", borderColor: "hsl(214, 32%, 91%)" }}>
            <CardHeader>
              <CardTitle className="flex items-center" style={{ color: "hsl(222, 84%, 4.9%)" }}>
                <Users className="mr-2 h-6 w-6" style={{ color: "hsl(221, 83%, 53%)" }} />
                Rol Tabanlı Erişim
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ color: "hsl(215, 16%, 46.9%)" }}>
                BUYER, SELLER ve ADMIN rolleri ile özelleştirilmiş kullanıcı deneyimi
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Demo Users Section */}
        <div className="mt-12">
          <Card style={{ backgroundColor: "hsl(0, 0%, 100%)", borderColor: "hsl(214, 32%, 91%)" }}>
            <CardHeader>
              <CardTitle className="flex items-center" style={{ color: "hsl(222, 84%, 4.9%)" }}>
                <Users className="mr-2 h-5 w-5" />
                Demo Kullanıcılar
              </CardTitle>
              <CardDescription style={{ color: "hsl(215, 16%, 46.9%)" }}>
                Test için kullanabileceğiniz örnek hesaplar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Admin User */}
                <div className="border rounded-lg p-4" style={{ borderColor: "hsl(214, 32%, 91%)" }}>
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      A
                    </div>
                    <div>
                      <h4 className="font-medium" style={{ color: "hsl(222, 84%, 4.9%)" }}>Admin</h4>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">ADMIN</span>
                    </div>
                  </div>
                  <div className="text-sm space-y-1">
                    <p style={{ color: "hsl(215, 16%, 46.9%)" }}><strong>E-posta:</strong> admin@example.com</p>
                    <p style={{ color: "hsl(215, 16%, 46.9%)" }}><strong>Şifre:</strong> 123456</p>
                  </div>
                </div>
                
                {/* Seller User */}
                <div className="border rounded-lg p-4" style={{ borderColor: "hsl(214, 32%, 91%)" }}>
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3" style={{ backgroundColor: "hsl(221, 83%, 53%)" }}>
                      AY
                    </div>
                    <div>
                      <h4 className="font-medium" style={{ color: "hsl(222, 84%, 4.9%)" }}>Ayşe Yılmaz</h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">SELLER</span>
                    </div>
                  </div>
                  <div className="text-sm space-y-1">
                    <p style={{ color: "hsl(215, 16%, 46.9%)" }}><strong>E-posta:</strong> ayse@firma.com</p>
                    <p style={{ color: "hsl(215, 16%, 46.9%)" }}><strong>Şifre:</strong> 123456</p>
                  </div>
                </div>
                
                {/* Buyer User */}
                <div className="border rounded-lg p-4" style={{ borderColor: "hsl(214, 32%, 91%)" }}>
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      MK
                    </div>
                    <div>
                      <h4 className="font-medium" style={{ color: "hsl(222, 84%, 4.9%)" }}>Mehmet Kaya</h4>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">BUYER</span>
                    </div>
                  </div>
                  <div className="text-sm space-y-1">
                    <p style={{ color: "hsl(215, 16%, 46.9%)" }}><strong>E-posta:</strong> mehmet@firma.com</p>
                    <p style={{ color: "hsl(215, 16%, 46.9%)" }}><strong>Şifre:</strong> 123456</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
