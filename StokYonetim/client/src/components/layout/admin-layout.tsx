import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3,
  Menu,
  X,
  User,
  Truck
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  const navigation = [
    {
      name: "Ana Sayfa",
      href: "/admin",
      icon: Home,
      current: location === "/admin",
    },
    {
      name: "Ürünler",
      href: "/admin/products",
      icon: Package,
      current: location === "/admin/products",
    },
    {
      name: "Stok Yönetimi",
      href: "/admin/inventory",
      icon: Package,
      current: location === "/admin/inventory",
    },
    {
      name: "Siparişler",
      href: "/admin/orders",
      icon: ShoppingCart,
      current: location === "/admin/orders",
    },
    {
      name: "Kargo Yönetimi",
      href: "/admin/shipping",
      icon: Truck,
      current: location === "/admin/shipping",
    },
    {
      name: "Müşteriler",
      href: "/admin/customers",
      icon: Users,
      current: location === "/admin/customers",
    },
    {
      name: "Raporlar",
      href: "/admin/reports",
      icon: BarChart3,
      current: location === "/admin/reports",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          data-testid="overlay-mobile"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out",
          "md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        data-testid="sidebar"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border">
            <Link href="/">
              <h2 className="text-xl font-bold text-primary">Destek Merkezi</h2>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
              data-testid="button-closesidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    item.current
                      ? "text-foreground bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  data-testid={`link-nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </a>
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="border-t border-border px-4 py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium" data-testid="text-username">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 md:px-6 py-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden mr-4"
              onClick={() => setSidebarOpen(true)}
              data-testid="button-opensidebar"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
