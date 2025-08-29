import { User } from "@shared/schema";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, LogOut, ChevronDown, Users } from "lucide-react";

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const [, setLocation] = useLocation();

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case "ADMIN": return "Yönetici";
      case "SELLER": return "Satıcı";
      case "BUYER": return "Alıcı";
      default: return "Kullanıcı";
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "ADMIN": return "bg-red-100 text-red-800";
      case "SELLER": return "bg-blue-100 text-blue-800";
      case "BUYER": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <nav className="border-b shadow-sm sticky top-0 z-50" style={{ backgroundColor: "hsl(0, 0%, 100%)", borderColor: "hsl(214, 32%, 91%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <h1 
                className="text-xl font-bold cursor-pointer"
                onClick={() => setLocation("/")}
                data-testid="link-home"
                style={{ color: "hsl(221, 83%, 53%)" }}
              >
                <Users className="inline mr-2" size={20} />
                Kullanıcı Yönetimi
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-3 h-auto p-2 hover:bg-muted transition-colors"
                  data-testid="button-user-menu"
                  style={{ color: "hsl(222, 84%, 4.9%)" }}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar_url || ""} />
                    <AvatarFallback className="text-sm" style={{ backgroundColor: "hsl(221, 83%, 53%)", color: "hsl(210, 40%, 98%)" }}>
                      {getInitials(user.first_name || undefined, user.last_name || undefined)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="font-medium text-sm" data-testid="text-user-name" style={{ color: "hsl(222, 84%, 4.9%)" }}>
                      {user.first_name} {user.last_name}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded ${getRoleBadgeColor(user.role)}`} data-testid="text-user-role">
                      {getRoleDisplayName(user.role)}
                    </span>
                  </div>
                  <ChevronDown size={16} style={{ color: "hsl(215, 16%, 46.9%)" }} />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-48" align="end" style={{ backgroundColor: "hsl(0, 0%, 100%)", borderColor: "hsl(214, 32%, 91%)" }}>
                <DropdownMenuItem 
                  onClick={() => setLocation("/settings")}
                  data-testid="button-settings"
                  style={{ color: "hsl(222, 84%, 4.9%)" }}
                >
                  <Settings className="mr-3 h-4 w-4" />
                  Ayarlar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onLogout}
                  data-testid="button-logout"
                  style={{ color: "hsl(0, 84%, 60%)" }}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
