import { useState } from 'react'
import { Router, Route, Link, useLocation } from 'wouter'
import { NotificationsPage } from './pages/NotificationsPage'
import { OrdersPage } from './pages/OrdersPage'
import { ProductsPage } from './pages/ProductsPage'
import { LoginPage } from './pages/LoginPage'
import { TestPage } from './pages/TestPage'
import { MessagesPage } from './pages/MessagesPage'
import { Bell, Package, ShoppingCart, LogOut, User, TestTube, MessageCircle } from 'lucide-react'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { useUnreadCount } from './hooks/useNotifications'
import { useUnreadMessageCount } from './hooks/useMessages'

// Örnek kullanıcı verisi - gerçek projede auth context'ten gelir
const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'Kullanıcı',
  role: 'BUYER' as const,
  company: 'Test Şirketi'
}

function App() {
  const [user, setUser] = useState(mockUser)
  const [location] = useLocation()
  const { data: unreadData } = useUnreadCount(user?.id)
  const unreadCount = unreadData?.count || 0
  
  const { data: unreadMessageData } = useUnreadMessageCount(user?.id)
  const unreadMessageCount = unreadMessageData?.count || 0

  if (!user) {
    return <LoginPage onLogin={setUser} />
  }

  const navigation = [
    {
      name: 'Ürünler',
      href: '/',
      icon: Package,
      active: location === '/',
    },
    {
      name: 'Siparişler',
      href: '/orders',
      icon: ShoppingCart,
      active: location === '/orders',
    },
    {
      name: 'Bildirimler',
      href: '/notifications',
      icon: Bell,
      active: location === '/notifications',
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      name: 'Mesajlar',
      href: '/messages',
      icon: MessageCircle,
      active: location === '/messages',
      badge: unreadMessageCount > 0 ? unreadMessageCount : undefined,
    },
    {
      name: 'Demo Test',
      href: '/test',
      icon: TestTube,
      active: location === '/test',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  B2B Marketplace
                </h1>
              </div>
              
              <div className="flex space-x-4">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant={item.active ? 'default' : 'ghost'}
                        className="relative"
                        data-testid={`nav-${item.name.toLowerCase()}`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.name}
                        {item.badge && (
                          <Badge 
                            variant="destructive" 
                            className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
                <Badge variant="secondary">{user.role}</Badge>
              </div>
              
              <Button
                variant="ghost"
                onClick={() => setUser(null)}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Router>
          <Route path="/" component={() => <ProductsPage user={user} />} />
          <Route path="/orders" component={() => <OrdersPage user={user} />} />
          <Route path="/notifications" component={() => <NotificationsPage user={user} />} />
          <Route path="/messages" component={() => <MessagesPage user={user} />} />
          <Route path="/test" component={() => <TestPage user={user} />} />
        </Router>
      </main>
    </div>
  )
}

export default App