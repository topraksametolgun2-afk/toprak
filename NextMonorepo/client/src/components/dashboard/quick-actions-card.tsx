import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function QuickActionsCard() {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    toast({
      title: "İşlem Tetiklendi",
      description: `${action} işlemi gerçek ortamda çalıştırılırdı.`,
    });
  };

  const actions = [
    {
      id: "migrations",
      icon: "💾",
      title: "Migrasyon Çalıştır",
      description: "Veritabanı şemasını güncelle",
      action: () => handleAction("Database Migration")
    },
    {
      id: "seed",
      icon: "🌱",
      title: "Veritabanını Besle",
      description: "Örnek veri ekle",
      action: () => handleAction("Database Seed")
    },
    {
      id: "build",
      icon: "🔨",
      title: "Projeyi Derle",
      description: "TypeScript'ı derle",
      action: () => handleAction("Project Build")
    }
  ];

  return (
    <Card data-testid="quick-actions-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="mr-2">⚡</span>
          Hızlı İşlemler
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="secondary"
              className="w-full justify-start p-3 h-auto"
              onClick={action.action}
              data-testid={`button-${action.id}`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{action.icon}</span>
                <div className="text-left">
                  <div className="text-sm font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
