import { Link, useLocation } from "wouter";
import { Home, Package, ShoppingCart, MessageCircle, HelpCircle, Ticket, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Ana Sayfa", href: "/", icon: Home },
  { name: "Ürünler", href: "/products", icon: Package },
  { name: "Siparişler", href: "/orders", icon: ShoppingCart },
  { name: "Mesajlar", href: "/messages", icon: MessageCircle },
  { name: "Destek", href: "/destek", icon: HelpCircle },
];

const adminNavigation = [
  { name: "Destek Talepleri", href: "/admin/tickets", icon: Ticket },
  { name: "Kullanıcılar", href: "/admin/users", icon: Users },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary">Toprak B2B</h1>
        <p className="text-sm text-muted-foreground">Profesyonel Platform</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                  location === item.href
                    ? "bg-secondary text-secondary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
                data-testid={`link-${item.name.toLowerCase().replace(' ', '-')}`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </a>
            </Link>
          );
        })}
        
        {/* Admin Only Section */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2 px-3">YÖNETİM</p>
          {adminNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                    location === item.href
                      ? "bg-secondary text-secondary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  data-testid={`link-admin-${item.name.toLowerCase().replace(' ', '-')}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
