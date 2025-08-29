import React, { useEffect, useState } from 'react'
export default function Admin(){
  const [users, setUsers] = useState([])
  useEffect(()=>{ fetch('/api/admin/users').then(r=>r.json()).then(setUsers) },[])
  return <div>
    <h2>Admin Paneli</h2>
    <pre>{JSON.stringify(users, null, 2)}</pre>
  </div>
}
