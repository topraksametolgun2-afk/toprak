import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
export default function ProductDetail(){
  const { id } = useParams()
  const [p, setP] = useState(null)
  const [reviews, setReviews] = useState({ reviews: [], average: 0 })
  useEffect(()=>{
    fetch('/api/products/'+id).then(r=>r.json()).then(setP)
    fetch('/api/reviews/'+id).then(r=>r.json()).then(setReviews)
  },[id])
  if(!p) return <div>Yükleniyor...</div>
  return <div>
    <h2>{p.name}</h2>
    <p>Fiyat: {p.price}₺</p>
    <p>Kategori: {p.category}</p>
    <p>Stok: {p.stock}</p>
    <p>Ortalama Puan: {reviews.average}</p>
    <h3>Yorumlar</h3>
    <ul>{reviews.reviews.map(r => <li key={r.id}>{r.rating}⭐ - {r.text}</li>)}</ul>
  </div>
}
