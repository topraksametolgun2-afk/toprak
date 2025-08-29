import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Settings, 
  Users, 
  HelpCircle, 
  BarChart3,
  Home,
  ShoppingCart,
  Bell
} from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path || location.startsWith(path);
  };

  const navItems = [
    {
      href: "/",
      label: "Ürünler",
      icon: Package,
      badge: null
    },
    {
      href: "/ayarlar",
      label: "Ayarlar",
      icon: Settings,
      badge: null
    },
    {
      href: "/destek",
      label: "Destek",
      icon: HelpCircle,
      badge: "2"
    },
    {
      href: "/stok",
      label: "Stok Yönetimi",
      icon: BarChart3,
      badge: null
    },
    {
      href: "/admin",
      label: "Admin Paneli",
      icon: Users,
      badge: null
    }
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ToprakSat
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={active ? "default" : "ghost"}
                      className="flex items-center gap-2"
                      data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                      {item.badge && (
                        <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" data-testid="notifications-button">
              <Bell className="h-5 w-5" />
            </Button>
            
            <div className="hidden md:flex items-center space-x-2">
              <div className="text-sm">
                <div className="font-medium text-gray-900 dark:text-white">John Doe</div>
                <div className="text-gray-500 dark:text-gray-400">ABC Şirketi</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={active ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {item.badge && (
                      <Badge variant="destructive" className="ml-1 h-4 px-1 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}