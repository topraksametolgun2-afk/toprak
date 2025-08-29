import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export function RecentUsersTable() {
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["/api/users?limit=5"],
  });

  const users = (usersData as any)?.users as User[] || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Son Kullanıcılar</CardTitle>
            <Skeleton className="h-4 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-recent-users">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle data-testid="text-recent-users-title">Son Kullanıcılar</CardTitle>
          <Link href="/users">
            <Button variant="link" size="sm" data-testid="button-view-all-users">
              Tümünü Gör
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {users.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground" data-testid="text-no-users">
            Henüz kullanıcı bulunmuyor
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Kullanıcı
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Durum
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Kayıt Tarihi
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr 
                  key={user.id} 
                  className="border-b border-border last:border-b-0"
                  data-testid={`row-user-${index}`}
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium" data-testid={`text-user-initials-${index}`}>
                          {getInitials(user.name)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground" data-testid={`text-user-name-${index}`}>
                          {user.name}
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-user-email-${index}`}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge 
                      variant={user.isActive ? "default" : "secondary"}
                      data-testid={`badge-user-status-${index}`}
                    >
                      {user.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground" data-testid={`text-user-date-${index}`}>
                    {formatDate(user.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
