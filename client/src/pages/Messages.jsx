import React, { useEffect, useRef, useState } from 'react'
export default function Messages(){
  const [text, setText] = useState('')
  const wsRef = useRef(null)
  useEffect(()=>{
    wsRef.current = new WebSocket(`ws://${location.host}/ws`)
    wsRef.current.onmessage = (e)=>{
      const data = JSON.parse(e.data)
      console.log('WS:', data)
    }
    return ()=> wsRef.current && wsRef.current.close()
  }, [])
  return <div>
    <h2>Mesajlar (Demo)</h2>
    <input value={text} onChange={e=>setText(e.target.value)} placeholder="Mesaj yaz..." />
    <button onClick={()=>alert('Demo: WS ile gönderilecek')}>Gönder</button>
  </div>
}
