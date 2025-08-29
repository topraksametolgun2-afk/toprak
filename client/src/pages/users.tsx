import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus } from "lucide-react";
import { Link } from "wouter";

interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const users = (usersData as any)?.users as User[] || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden" data-testid="page-users">
      <Header 
        title="Kullanıcılar" 
        description="Tüm kullanıcıları görüntüleyin ve yönetin."
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle data-testid="text-users-title">Kullanıcı Listesi</CardTitle>
              <Link href="/users/new">
                <Button data-testid="button-add-user">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Yeni Kullanıcı
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12" data-testid="text-no-users">
                <p className="text-muted-foreground mb-4">Henüz kullanıcı bulunmuyor</p>
                <Link href="/users/new">
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    İlk Kullanıcıyı Ekle
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user, index) => (
                  <div 
                    key={user.id}
                    className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    data-testid={`user-item-${index}`}
                  >
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium" data-testid={`user-initials-${index}`}>
                        {getInitials(user.name)}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground" data-testid={`user-name-${index}`}>
                        {user.name}
                      </h3>
                      <p className="text-sm text-muted-foreground" data-testid={`user-email-${index}`}>
                        {user.email}
                      </p>
                    </div>
                    
                    <Badge 
                      variant={user.isActive ? "default" : "secondary"}
                      data-testid={`user-status-${index}`}
                    >
                      {user.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                    
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground" data-testid={`user-date-${index}`}>
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
