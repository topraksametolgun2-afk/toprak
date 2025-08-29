import React, { useEffect, useState } from 'react'
export default function Lists(){
  const [lists, setLists] = useState([])
  useEffect(()=>{ fetch('/api/lists').then(r=>r.json()).then(setLists) },[])
  return <div>
    <h2>Listeler</h2>
    <pre>{JSON.stringify(lists, null, 2)}</pre>
  </div>
}
