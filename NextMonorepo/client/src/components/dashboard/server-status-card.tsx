import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface HealthStatus {
  status: string;
  services: {
    database: string;
    server: string;
  };
  stats?: {
    totalUsers: number;
  };
}

export function ServerStatusCard() {
  const [isChecking, setIsChecking] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: healthData, isLoading } = useQuery<HealthStatus>({
    queryKey: ["/api/health"],
    refetchOnMount: true,
  });

  const isHealthy = healthData?.status === "healthy";
  const isDatabaseConnected = healthData?.services?.database === "connected";
  const isServerRunning = healthData?.services?.server === "running";

  const handleHealthCheck = async () => {
    setIsChecking(true);
    try {
      await queryClient.refetchQueries({ queryKey: ["/api/health"] });
      toast({
        title: "Sağlık Kontrolü Tamamlandı",
        description: "Sunucu sağlık durumu güncellendi.",
      });
    } catch (error) {
      toast({
        title: "Sağlık Kontrolü Başarısız",
        description: "Sunucu sağlığı kontrol edilemedi.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card data-testid="server-status-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <span className="mr-2">🖥️</span>
            Sunucu Durumu
          </span>
          <div className={`status-indicator ${isHealthy ? 'status-online' : 'status-offline'}`}>
            <span className={`text-lg ${isHealthy ? 'text-success' : 'text-destructive'}`}>
              {isHealthy ? '✅' : '❌'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center" data-testid="frontend-status">
            <span className="text-sm text-muted-foreground">Ön Yüz</span>
            <span className="text-sm font-medium text-success flex items-center">
              <span className="w-2 h-2 bg-success rounded-full mr-2"></span>
              Çalışıyor
            </span>
          </div>
          
          <div className="flex justify-between items-center" data-testid="backend-status">
            <span className="text-sm text-muted-foreground">Arka Yüz</span>
            <span className={`text-sm font-medium flex items-center ${isServerRunning ? 'text-success' : 'text-destructive'}`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${isServerRunning ? 'bg-success' : 'bg-destructive'}`}></span>
              {isServerRunning ? 'Çalışıyor' : 'Çevrimdışı'}
            </span>
          </div>
          
          <div className="flex justify-between items-center" data-testid="database-status">
            <span className="text-sm text-muted-foreground">Veritabanı</span>
            <span className={`text-sm font-medium flex items-center ${isDatabaseConnected ? 'text-success' : 'text-destructive'}`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${isDatabaseConnected ? 'bg-success' : 'bg-destructive'}`}></span>
              {isDatabaseConnected ? 'Bağlı' : 'Bağlantısız'}
            </span>
          </div>

          {healthData?.stats && (
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Toplam Kullanıcı</span>
              <span className="text-sm font-medium">{healthData.stats.totalUsers}</span>
            </div>
          )}
        </div>
        
        <Button 
          onClick={handleHealthCheck}
          disabled={isChecking || isLoading}
          className="w-full mt-4"
          data-testid="button-check-health"
        >
          {isChecking ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Kontrol Ediliyor...
            </>
          ) : (
            'Sunucu Sağlığını Kontrol Et'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
