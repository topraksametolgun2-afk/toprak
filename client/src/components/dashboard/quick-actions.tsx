import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Database, BarChart3, Settings } from "lucide-react";
import { Link } from "wouter";

const actions = [
  {
    title: "Yeni Kullanıcı",
    description: "Kullanıcı ekle",
    icon: UserPlus,
    href: "/users/new",
    variant: "default" as const,
  },
  {
    title: "Veri Yönetimi",
    description: "CRUD işlemleri",
    icon: Database,
    href: "/data",
    variant: "secondary" as const,
  },
  {
    title: "Rapor Oluştur",
    description: "Analiz ve raporlar",
    icon: BarChart3,
    href: "/reports",
    variant: "outline" as const,
  },
  {
    title: "Sistem Ayarları",
    description: "Konfigürasyon",
    icon: Settings,
    href: "/settings",
    variant: "ghost" as const,
  },
];

export function QuickActions() {
  return (
    <Card data-testid="card-quick-actions">
      <CardHeader>
        <CardTitle data-testid="text-quick-actions-title">Hızlı İşlemler</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            
            return (
              <Link key={action.title} href={action.href}>
                <Button
                  variant={action.variant}
                  className="h-auto p-4 text-left flex-col items-start space-y-2 w-full"
                  data-testid={`button-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="h-6 w-6" />
                  <div>
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm opacity-80">{action.description}</p>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
