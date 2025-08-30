import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { User, ShoppingCart } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b" data-testid="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary cursor-pointer" data-testid="link-logo">
                Toprak
              </h1>
            </Link>
            <nav className="hidden md:flex ml-8 space-x-8">
              <Link href="/" className="text-foreground hover:text-primary transition-colors" data-testid="link-home">
                Ana Sayfa
              </Link>
              <Link href="/urunler" className="text-primary font-medium" data-testid="link-products">
                Ürünler
              </Link>
              <span className="text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-categories">
                Kategoriler
              </span>
              <span className="text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-contact">
                İletişim
              </span>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" data-testid="button-user">
              <User className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="relative" data-testid="button-cart">
              <ShoppingCart className="h-4 w-4" />
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
