import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  status: "healthy" | "untested" | "protected";
  description: string;
}

const endpoints: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/health",
    status: "healthy",
    description: "Sunucu sağlık kontrolü"
  },
  {
    method: "POST",
    path: "/api/users",
    status: "untested",
    description: "Yeni kullanıcı oluştur"
  },
  {
    method: "GET",
    path: "/api/users",
    status: "protected",
    description: "Tüm kullanıcıları listele"
  },
  {
    method: "GET",
    path: "/api/users/:id",
    status: "untested",
    description: "ID ile kullanıcı getir"
  }
];

const getMethodColor = (method: string) => {
  switch (method) {
    case "GET":
      return "success";
    case "POST":
      return "primary";
    case "PUT":
      return "warning";
    case "DELETE":
      return "destructive";
    default:
      return "secondary";
  }
};

const getStatusIndicator = (status: string) => {
  switch (status) {
    case "healthy":
      return { color: "success", text: "200 OK", dot: "bg-success" };
    case "protected":
      return { color: "warning", text: "Protected", dot: "bg-warning" };
    case "untested":
      return { color: "muted", text: "Not tested", dot: "bg-muted-foreground" };
    default:
      return { color: "muted", text: "Unknown", dot: "bg-muted-foreground" };
  }
};

export function ApiEndpointsCard() {
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const handleTestEndpoints = async () => {
    setIsTesting(true);
    
    // Simulate testing all endpoints
    setTimeout(() => {
      setIsTesting(false);
      toast({
        title: "Endpoint Testi Tamamlandı",
        description: "Tüm API endpoint'leri test edildi.",
      });
    }, 2000);
  };

  return (
    <Card data-testid="api-endpoints-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="mr-2">🔌</span>
          API Noktaları
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {endpoints.map((endpoint, index) => {
            const statusInfo = getStatusIndicator(endpoint.status);
            const methodColorClass = getMethodColor(endpoint.method);
            
            return (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 border rounded-lg ${
                  endpoint.status === "healthy" 
                    ? "bg-success/10 border-success/20" 
                    : "bg-muted border-border"
                }`}
                data-testid={`endpoint-${endpoint.method.toLowerCase()}-${endpoint.path.replace(/[^a-zA-Z0-9]/g, '-')}`}
              >
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={methodColorClass as any}
                    className={`${
                      methodColorClass === "success" ? "bg-success text-success-foreground" :
                      methodColorClass === "primary" ? "bg-primary text-primary-foreground" :
                      methodColorClass === "warning" ? "bg-warning text-warning-foreground" :
                      methodColorClass === "destructive" ? "bg-destructive text-destructive-foreground" :
                      "bg-secondary text-secondary-foreground"
                    } text-xs font-medium`}
                  >
                    {endpoint.method}
                  </Badge>
                  <span className="font-mono text-sm">{endpoint.path}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 ${statusInfo.dot} rounded-full`}></span>
                  <span className={`text-xs font-medium ${
                    statusInfo.color === "success" ? "text-success" :
                    statusInfo.color === "warning" ? "text-warning" :
                    "text-muted-foreground"
                  }`}>
                    {statusInfo.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        <Button 
          variant="secondary"
          className="w-full mt-4"
          onClick={handleTestEndpoints}
          disabled={isTesting}
          data-testid="button-test-endpoints"
        >
          {isTesting ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Endpointler Test Ediliyor...
            </>
          ) : (
            'Tüm Endpointleri Test Et'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
