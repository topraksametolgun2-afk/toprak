import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { BarChart3, ShoppingCart, Users, MessageSquare } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: BarChart3,
      title: "Raporlar",
      description: "Detaylı analitik ve raporlama",
      href: "/reports"
    },
    {
      icon: ShoppingCart,
      title: "Siparişler",
      description: "Sipariş yönetimi ve takibi", 
      href: "/orders"
    },
    {
      icon: Users,
      title: "Kullanıcılar",
      description: "Kullanıcı yönetimi",
      href: "/users"
    },
    {
      icon: MessageSquare,
      title: "Mesajlar",
      description: "Mesajlaşma sistemi",
      href: "/messages"
    }
  ];

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">DrizzleStarter uygulamasına hoş geldiniz</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="h-full transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <Link href={feature.href}>
                  <Button className="w-full" data-testid={`button-${feature.title.toLowerCase()}`}>
                    {feature.title} Sayfasına Git
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
