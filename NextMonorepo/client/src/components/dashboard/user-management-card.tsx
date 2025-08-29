import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface User {
  id: string;
  email: string;
  role: "BUYER" | "SELLER" | "ADMIN";
  createdAt: string;
}

const getRoleColor = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "destructive";
    case "SELLER":
      return "default";
    case "BUYER":
      return "secondary";
    default:
      return "secondary";
  }
};

const getInitials = (email: string) => {
  return email.charAt(0).toUpperCase();
};

export function UserManagementCard() {
  const { data: users = [], isLoading, error } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const getRoleColorClass = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-destructive/20 text-destructive";
      case "SELLER":
        return "bg-warning/20 text-warning";
      case "BUYER":
        return "bg-primary/20 text-primary";
      default:
        return "bg-secondary/20 text-secondary-foreground";
    }
  };

  return (
    <Card data-testid="user-management-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <span className="mr-2">👥</span>
            Kullanıcı Yönetimi
          </CardTitle>
          <Button variant="ghost" size="sm" data-testid="button-view-all-users">
            Tümünü Gör
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {isLoading && (
            <div className="text-sm text-muted-foreground" data-testid="users-loading">
              Kullanıcılar yükleniyor...
            </div>
          )}
          
          {error && (
            <div className="text-sm text-destructive" data-testid="users-error">
              Kullanıcılar yüklenemedi. Veritabanı bağlantınızı kontrol edin.
            </div>
          )}
          
          {users.length === 0 && !isLoading && !error && (
            <div className="text-sm text-muted-foreground" data-testid="users-empty">
              Kullanıcı bulunamadı. Veritabanı boş olabilir.
            </div>
          )}
          
          {users.slice(0, 3).map((user) => (
            <div 
              key={user.id} 
              className="flex items-center space-x-3 p-3 border border-border rounded-lg"
              data-testid={`user-item-${user.id}`}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials(user.email)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="text-sm font-medium" data-testid={`user-email-${user.id}`}>
                  {user.email}
                </div>
                <div className="text-xs text-muted-foreground">
                  <span 
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColorClass(user.role)}`}
                    data-testid={`user-role-${user.id}`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" data-testid={`button-user-menu-${user.id}`}>
                ⋮
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
