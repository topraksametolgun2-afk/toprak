import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Headphones, 
  Package, 
  Search, 
  Bot, 
  Ticket, 
  Settings,
  ChevronUp,
  User,
  BarChart3,
  ShieldCheck,
  HelpCircle
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Destek Merkezi", href: "/destek-merkezi", icon: Headphones },
  { name: "Destek Talebi", href: "/support-center", icon: HelpCircle },
  { name: "Stok Yönetimi", href: "/stok-yonetimi", icon: Package },
  { name: "Ürün Arama", href: "/urun-arama", icon: Search },
  { name: "Turkish Bot", href: "/turkish-bot", icon: Bot },
  { name: "Ticket Sistemi", href: "/ticket-sistemi", icon: Ticket },
  { name: "Admin Panel", href: "/admin", icon: ShieldCheck },
  { name: "Ayarlar", href: "/ayarlar", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col" data-testid="sidebar">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center" data-testid="logo">
            <BarChart3 className="text-primary-foreground text-sm" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Toprak</h1>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4" data-testid="navigation">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link href={item.href} className={cn(
                  "sidebar-item flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                  isActive && "active"
                )} data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted" data-testid="user-profile">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="text-primary-foreground text-xs" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Admin User</p>
            <p className="text-xs text-muted-foreground truncate">admin@toprak.com</p>
          </div>
          <button className="text-muted-foreground hover:text-foreground" data-testid="profile-toggle">
            <ChevronUp className="text-xs" />
          </button>
        </div>
      </div>
    </aside>
  );
}
