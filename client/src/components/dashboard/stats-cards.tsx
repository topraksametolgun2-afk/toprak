import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Activity, Database, TrendingUp, TrendingDown } from "lucide-react";

interface SystemStats {
  totalUsers: number;
  activeSessions: number;
  dataRecords: number;
  apiRequests: number;
}

const statsConfig = [
  {
    title: "Toplam Kullanıcı",
    key: "totalUsers" as keyof SystemStats,
    icon: Users,
    color: "bg-blue-100 text-blue-600",
    change: "+12%",
    changeType: "increase" as const,
    period: "Son aydan"
  },
  {
    title: "Aktif Oturumlar",
    key: "activeSessions" as keyof SystemStats,
    icon: Activity,
    color: "bg-green-100 text-green-600",
    change: "+8%",
    changeType: "increase" as const,
    period: "Son haftadan"
  },
  {
    title: "Veri Kayıtları",
    key: "dataRecords" as keyof SystemStats,
    icon: Database,
    color: "bg-purple-100 text-purple-600",
    change: "+24%",
    changeType: "increase" as const,
    period: "Son aydan"
  },
  {
    title: "API İstekleri",
    key: "apiRequests" as keyof SystemStats,
    icon: TrendingUp,
    color: "bg-orange-100 text-orange-600",
    change: "-3%",
    changeType: "decrease" as const,
    period: "Son günden"
  },
];

export function StatsCards() {
  const { data: systemStatus, isLoading } = useQuery({
    queryKey: ["/api/system/status"],
  });

  const stats = (systemStatus as any)?.stats as SystemStats || {} as SystemStats;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
              <div className="mt-4">
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((config) => {
        const Icon = config.icon;
        const value = stats?.[config.key] || 0;
        const TrendIcon = config.changeType === "increase" ? TrendingUp : TrendingDown;
        
        return (
          <Card key={config.key} data-testid={`card-stat-${config.key}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    {config.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground" data-testid={`text-${config.key}`}>
                    {value.toLocaleString('tr-TR')}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className={`flex items-center ${
                  config.changeType === "increase" ? "text-green-600" : "text-red-600"
                }`}>
                  <TrendIcon className="h-3 w-3 mr-1" />
                  {config.change}
                </span>
                <span className="text-muted-foreground ml-2">
                  {config.period}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
