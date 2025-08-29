import React, { useEffect, useState } from 'react'
export default function Support(){
  const [list, setList] = useState([])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const load = ()=> fetch('/api/support/tickets').then(r=>r.json()).then(setList)
  useEffect(()=>{ load() },[])
  const create = async ()=>{
    await fetch('/api/support/tickets', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({subject, message}) })
    setSubject(''); setMessage(''); load()
  }
  return <div>
    <h2>Yardım Merkezi</h2>
    <div>
      <input placeholder="Konu" value={subject} onChange={e=>setSubject(e.target.value)} />
      <input placeholder="Mesaj" value={message} onChange={e=>setMessage(e.target.value)} />
      <button onClick={create}>Talep Oluştur</button>
    </div>
    <pre>{JSON.stringify(list, null, 2)}</pre>
  </div>
}
