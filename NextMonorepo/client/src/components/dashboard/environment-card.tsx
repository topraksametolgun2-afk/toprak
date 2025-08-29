import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EnvironmentCard() {
  const environment = {
    nodeEnv: "development",
    port: import.meta.env.VITE_PORT || "5000",
    database: "PostgreSQL (Supabase)"
  };

  const databaseUrl = import.meta.env.VITE_DATABASE_URL || "postgresql://user:***@localhost:5432/postgres";
  const maskedUrl = databaseUrl.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");

  return (
    <Card data-testid="environment-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="mr-2">⚙️</span>
          Ortam
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center" data-testid="env-node">
            <span className="text-sm text-muted-foreground">NODE_ENV</span>
            <span className="text-sm font-medium font-mono bg-muted px-2 py-1 rounded">
              {environment.nodeEnv}
            </span>
          </div>
          
          <div className="flex justify-between items-center" data-testid="env-port">
            <span className="text-sm text-muted-foreground">Port</span>
            <span className="text-sm font-medium font-mono bg-muted px-2 py-1 rounded">
              {environment.port}
            </span>
          </div>
          
          <div className="flex justify-between items-center" data-testid="env-database">
            <span className="text-sm text-muted-foreground">Veritabanı</span>
            <span className="text-sm font-medium text-success flex items-center">
              <span className="w-2 h-2 bg-success rounded-full mr-2"></span>
              {environment.database}
            </span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-muted rounded-lg" data-testid="database-url">
          <div className="text-xs text-muted-foreground mb-1">Veritabanı URL</div>
          <div className="font-mono text-xs break-all">{maskedUrl}</div>
        </div>
      </CardContent>
    </Card>
  );
}
