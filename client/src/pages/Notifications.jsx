import React, { useEffect, useState } from 'react'
export default function Notifications(){
  const [list, setList] = useState([])
  useEffect(()=>{ fetch('/api/notifications').then(r=>r.json()).then(setList) },[])
  return <div>
    <h2>Bildirimler</h2>
    <ul>{list.map(n => <li key={n.id}>{n.message}</li>)}</ul>
  </div>
}
