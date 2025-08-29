import React, { useEffect, useState } from 'react'
export default function Cart(){
  const [items, setItems] = useState([])
  useEffect(()=>{ fetch('/api/cart').then(r=>r.json()).then(setItems) },[])
  return <div>
    <h2>Sepetim</h2>
    <pre>{JSON.stringify(items, null, 2)}</pre>
  </div>
}
