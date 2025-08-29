import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
export default function Products(){
  const [items, setItems] = useState([])
  useEffect(()=>{ fetch('/api/products').then(r=>r.json()).then(setItems) },[])
  return <div>
    <h2>Ürünler</h2>
    <ul>
      {items.map(p=> <li key={p.id}><Link to={`/products/${p.id}`}>{p.name} - {p.price}₺</Link></li>)}
    </ul>
  </div>
}
