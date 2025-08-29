import React, { useEffect, useState } from 'react'
export default function Reports(){
  const [sales, setSales] = useState(null)
  const [orders, setOrders] = useState(null)
  const [users, setUsers] = useState(null)
  const [messages, setMsgs] = useState(null)
  useEffect(()=>{
    fetch('/api/reports/sales').then(r=>r.json()).then(setSales)
    fetch('/api/reports/orders').then(r=>r.json()).then(setOrders)
    fetch('/api/reports/users').then(r=>r.json()).then(setUsers)
    fetch('/api/reports/messages').then(r=>r.json()).then(setMsgs)
  },[])
  return <div>
    <h2>Raporlar (Demo)</h2>
    <pre>{JSON.stringify({sales, orders, users, messages}, null, 2)}</pre>
  </div>
}
