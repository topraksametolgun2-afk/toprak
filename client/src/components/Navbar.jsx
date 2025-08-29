import React from 'react'
import { Link } from 'react-router-dom'
export default function Navbar(){
  const ulStyle = { display: 'flex', gap: 12, listStyle: 'none', padding: 8, borderBottom: '1px solid #eee' }
  return (
    <nav>
      <ul style={ulStyle}>
        <li><Link to="/">Ana Sayfa</Link></li>
        <li><Link to="/products">Ürünler</Link></li>
        <li><Link to="/cart">Sepet</Link></li>
        <li><Link to="/orders">Siparişler</Link></li>
        <li><Link to="/messages">Mesajlar</Link></li>
        <li><Link to="/notifications">Bildirimler</Link></li>
        <li><Link to="/reports">Raporlar</Link></li>
        <li><Link to="/favorites">Favoriler</Link></li>
        <li><Link to="/lists">Listeler</Link></li>
        <li><Link to="/inventory">Stok</Link></li>
        <li><Link to="/support">Destek</Link></li>
        <li><Link to="/admin">Admin</Link></li>
        <li><Link to="/settings">Ayarlar</Link></li>
      </ul>
    </nav>
  )
}
