import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface SystemStatus {
  status: string;
  database: string;
  auth: string;
  api: string;
  environment: {
    NODE_ENV: string;
    PORT: string;
    SUPABASE_URL: string;
  };
}

const statusConfig = [
  {
    key: "database",
    label: "Supabase Veritabanı",
    description: "Bağlantı durumu"
  },
  {
    key: "auth",
    label: "Kimlik Doğrulama",
    description: "Auth servisi"
  },
  {
    key: "api",
    label: "API Servisleri",
    description: "REST API durumu"
  }
];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "connected":
    case "active":
    case "operational":
      return "bg-green-500";
    case "slow":
    case "warning":
      return "bg-yellow-500";
    case "error":
    case "disconnected":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusText = (status: string) => {
  switch (status.toLowerCase()) {
    case "connected":
      return "Çevrimiçi";
    case "active":
      return "Aktif";
    case "operational":
      return "Çalışıyor";
    case "slow":
      return "Yavaş";
    default:
      return status;
  }
};

export function SystemStatus() {
  const { data: systemStatus, isLoading } = useQuery({
    queryKey: ["/api/system/status"],
  });

  const status = systemStatus as SystemStatus;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sistem Durumu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 bg-secondary rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          ))}
          
          <div className="p-4 bg-muted rounded-lg">
            <Skeleton className="h-5 w-32 mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-system-status">
      <CardHeader>
        <CardTitle data-testid="text-system-status-title">Sistem Durumu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {statusConfig.map((config) => {
          const serviceStatus = status?.[config.key as keyof SystemStatus] as string;
          
          return (
            <div 
              key={config.key}
              className="flex items-center justify-between p-4 bg-secondary rounded-lg"
              data-testid={`status-${config.key}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(serviceStatus)}`}></div>
                <div>
                  <p className="font-medium text-foreground">
                    {config.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {config.description}
                  </p>
                </div>
              </div>
              <Badge 
                variant={serviceStatus === "connected" || serviceStatus === "active" || serviceStatus === "operational" ? "default" : "secondary"}
                data-testid={`badge-${config.key}-status`}
              >
                {getStatusText(serviceStatus)}
              </Badge>
            </div>
          );
        })}

        {/* Environment Info */}
        {status?.environment && (
          <div className="p-4 bg-muted rounded-lg" data-testid="environment-info">
            <h4 className="font-medium text-foreground mb-3">Ortam Bilgileri</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ortam:</span>
                <span className="font-medium" data-testid="text-env-node">
                  {status.environment.NODE_ENV}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Port:</span>
                <span className="font-medium" data-testid="text-env-port">
                  {status.environment.PORT}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Supabase URL:</span>
                <span className="font-medium text-xs" data-testid="text-env-supabase">
                  {status.environment.SUPABASE_URL}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
