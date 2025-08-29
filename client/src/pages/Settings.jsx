import React, { useEffect, useState } from 'react'
export default function Settings(){
  const [profile, setProfile] = useState({})
  useEffect(()=>{ fetch('/api/profile').then(r=>r.json()).then(setProfile) },[])
  const save = async ()=>{
    await fetch('/api/profile', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(profile) })
    alert('Kaydedildi (demo)')
  }
  return <div>
    <h2>Ayarlar</h2>
    <input placeholder="İsim" value={profile.name||''} onChange={e=>setProfile({...profile, name:e.target.value})} />
    <input placeholder="Firma" value={profile.company||''} onChange={e=>setProfile({...profile, company:e.target.value})} />
    <button onClick={save}>Kaydet</button>
  </div>
}
