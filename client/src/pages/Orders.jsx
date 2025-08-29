import React, { useEffect, useState } from 'react'
export default function Orders(){
  const [orders, setOrders] = useState([])
  useEffect(()=>{ fetch('/api/orders').then(r=>r.json()).then(setOrders) },[])
  return <div>
    <h2>Siparişlerim</h2>
    <pre>{JSON.stringify(orders, null, 2)}</pre>
  </div>
}
