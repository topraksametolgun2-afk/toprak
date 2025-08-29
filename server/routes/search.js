import { Router } from "express";
const router = Router();
const sampleProducts = [
  { id: "p1", name: "Çay 1kg", category: "İçecek", price: 150, stock: 25, rating: 4.5 },
  { id: "p2", name: "Un 25kg", category: "Gıda", price: 800, stock: 12, rating: 4.1 },
  { id: "p3", name: "Zeytinyağı 5L", category: "Gıda", price: 950, stock: 7, rating: 4.7 },
  { id: "p4", name: "Vida Seti", category: "İnşaat", price: 220, stock: 60, rating: 4.0 },
  { id: "p5", name: "Gümüş Kolye", category: "Takı", price: 450, stock: 14, rating: 4.3 },
];
router.get("/", (req, res) => {
  const { q = "", category, minPrice, maxPrice, minRating } = req.query;
  let result = sampleProducts.filter(p => p.name.toLowerCase().includes(String(q).toLowerCase()));
  if (category) result = result.filter(p => p.category === category);
  if (minPrice) result = result.filter(p => p.price >= Number(minPrice));
  if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));
  if (minRating) result = result.filter(p => p.rating >= Number(minRating));
  res.json(result);
});
export default router;
