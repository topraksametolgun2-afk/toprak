import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { AuthUser, CartItemWithProduct } from "@shared/schema";
import { motion } from "framer-motion";

export default function Navigation() {
  const [location] = useLocation();

  const { data: user } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
  });

  // Get cart items count
  const { data: cartItems } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
  });

  const cartItemsCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  const navItems = [
    { href: "/", label: "Dashboard", id: "dashboard" },
    { href: "/products", label: "Ürünler", id: "products" },
    { href: "/favorites", label: "Favoriler", id: "favorites" },
    { href: "/lists", label: "Listeler", id: "lists" },
    { href: "/orders", label: "Siparişler", id: "orders" },
    ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin Paneli", id: "admin" }] : []),
    { href: "/reports", label: "Raporlar", id: "reports" },
    { href: "/settings", label: "Ayarlar", id: "settings" },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-card border-b border-border sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <motion.h1 
                  whileHover={{ scale: 1.05 }}
                  className="text-xl font-bold text-primary cursor-pointer"
                >
                  DrizzleStarter
                </motion.h1>
              </Link>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link key={item.id} href={item.href}>
                    <motion.div
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={location === item.href ? "default" : "ghost"}
                        size="sm"
                        className="transition-all duration-200"
                        data-testid={`nav-${item.id}`}
                      >
                        {item.label}
                      </Button>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              {/* Cart Icon */}
              <Link href="/cart">
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Button
                    variant={location === "/cart" ? "default" : "ghost"}
                    size="icon"
                    className="relative"
                    data-testid="nav-cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemsCount > 0 && (
                      <Badge 
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
                        data-testid="cart-badge"
                      >
                        {cartItemsCount}
                      </Badge>
                    )}
                  </Button>
                </motion.div>
              </Link>
              <span className="text-sm text-muted-foreground" data-testid="user-name">
                {user?.username || "Kullanıcı"}
              </span>
              <Badge 
                variant={user?.role === "toptancı" ? "default" : "secondary"}
                data-testid="user-role"
              >
                {user?.role === "toptancı" ? "Toptancı" : "Alıcı"}
              </Badge>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  variant="ghost" 
                  size="icon"
                  data-testid="button-logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
