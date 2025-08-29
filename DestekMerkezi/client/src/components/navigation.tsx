import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { HelpCircle, Package, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function Navigation() {
  const [location] = useLocation();
  
  const { data: user } = useQuery({
    queryKey: ['/api/me'],
  }) as { data: User | undefined };

  const isAdmin = user?.isAdmin === 'true';

  const navItems = [
    { path: "/", label: "Destek Taleplerim", icon: HelpCircle },
    { path: "/products", label: "Ürün Kataloğu", icon: Package },
    ...(isAdmin ? [{ path: "/admin", label: "Admin Paneli", icon: Settings }] : [])
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Destek Sistemi
            </h1>
            <div className="flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      data-testid={`nav-link-${item.path.replace('/', '') || 'home'}`}
                      variant={isActive ? "default" : "ghost"}
                      className="flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user ? `Hoş geldiniz, ${user.username}` : "Yükleniyor..."}
              {isAdmin && (
                <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                  Admin
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}