import React, { useEffect, useState } from 'react'
export default function Inventory(){
  const [items, setItems] = useState([])
  const refresh = ()=> fetch('/api/inventory').then(r=>r.json()).then(setItems)
  useEffect(()=>{ refresh() },[])
  const plusOne = async (product_id, quantity)=>{
    await fetch('/api/inventory/update', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({product_id, quantity: quantity+1}) })
    refresh()
  }
  return <div>
    <h2>Stok Yönetimi</h2>
    <table>
      <thead><tr><th>Ürün</th><th>Adet</th><th>Güncelle</th></tr></thead>
      <tbody>
      {items.map(it => <tr key={it.product_id}>
        <td>{it.product_id}</td>
        <td>{it.quantity}</td>
        <td><button onClick={()=>plusOne(it.product_id, it.quantity)}>+1</button></td>
      </tr>)}
      </tbody>
    </table>
  </div>
}
