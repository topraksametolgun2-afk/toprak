import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Command {
  command: string;
  description: string;
}

const setupCommands: Command[] = [
  {
    command: "npm install",
    description: "Bağımlılıkları yükle"
  },
  {
    command: "npm run db:push",
    description: "Veritabanı şemasını gönder"
  },
  {
    command: "cp .env.example .env",
    description: "Ortam değişkenlerini ayarla"
  }
];

const developmentCommands: Command[] = [
  {
    command: "npm run dev",
    description: "Geliştirme sunucularını başlat"
  },
  {
    command: "npm run build",
    description: "Üretim için derle"
  },
  {
    command: "npm run check",
    description: "TypeScript tip kontrolü"
  }
];

function CommandSection({ title, commands }: { title: string; commands: Command[] }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        {title === "Setup" ? "Kurulum" : title === "Development" ? "Geliştirme" : title}
      </h4>
      <div className="space-y-2">
        {commands.map((cmd, index) => (
          <div key={index} className="bg-muted p-3 rounded-lg" data-testid={`command-${cmd.command.replace(/[^a-zA-Z0-9]/g, '-')}`}>
            <div className="font-mono text-sm">{cmd.command}</div>
            <div className="text-xs text-muted-foreground mt-1">{cmd.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DevelopmentCommands() {
  return (
    <Card className="mt-6" data-testid="development-commands">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="mr-2">💻</span>
          Geliştirme Komutları
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CommandSection title="Setup" commands={setupCommands} />
          <CommandSection title="Development" commands={developmentCommands} />
        </div>
      </CardContent>
    </Card>
  );
}
