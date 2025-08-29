import React, { useEffect, useState } from 'react'
export default function Favorites(){
  const [list, setList] = useState([])
  useEffect(()=>{ fetch('/api/favorites').then(r=>r.json()).then(setList) },[])
  return <div>
    <h2>Favoriler</h2>
    <pre>{JSON.stringify(list, null, 2)}</pre>
  </div>
}
