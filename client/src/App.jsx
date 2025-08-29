import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Products from './pages/Products.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import Orders from './pages/Orders.jsx'
import Messages from './pages/Messages.jsx'
import Notifications from './pages/Notifications.jsx'
import Reports from './pages/Reports.jsx'
import Favorites from './pages/Favorites.jsx'
import Lists from './pages/Lists.jsx'
import Inventory from './pages/Inventory.jsx'
import Support from './pages/Support.jsx'
import Admin from './pages/Admin.jsx'
import Settings from './pages/Settings.jsx'

export default function App(){
  return (
    <div>
      <Navbar />
      <div style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/lists" element={<Lists />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/support" element={<Support />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  )
}
