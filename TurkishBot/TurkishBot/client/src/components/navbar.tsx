import { useState } from "react";
import { Link, useLocation } from "wouter";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, LogOut, Users } from "lucide-react";

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const [location] = useLocation();

  if (!user) return null;

  const getInitials = (firstName?: string, lastName?: string): string => {
    const first = firstName?.charAt(0)?.toUpperCase() || "";
    const last = lastName?.charAt(0)?.toUpperCase() || "";
    return first + last || "U";
  };

  const getDisplayName = (firstName?: string, lastName?: string): string => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName) return firstName;
    if (lastName) return lastName;
    return "Kullanıcı";
  };

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case "ADMIN": return "Yönetici";
      case "SELLER": return "Satıcı";
      case "BUYER": return "Alıcı";
      default: return role;
    }
  };

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-primary hover:text-primary/80 transition-colors">
              <Users className="h-6 w-6" />
              <span>Kullanıcı Yönetimi</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 text-sm rounded-lg p-2 hover:bg-muted transition-colors" data-testid="user-menu-button">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                      {getInitials(user.first_name || undefined, user.last_name || undefined)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="font-medium text-foreground">
                      {getDisplayName(user.first_name || undefined, user.last_name || undefined)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getRoleLabel(user.role)}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center cursor-pointer" data-testid="link-settings">
                    <Settings className="mr-3 h-4 w-4" />
                    Ayarlar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive cursor-pointer" data-testid="button-logout">
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
