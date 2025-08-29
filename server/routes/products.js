import { Router } from "express";
const router = Router();

let products = [
  { id: "p1", name: "Çay 1kg", category: "İçecek", price: 150, stock: 25, rating: 4.5 },
  { id: "p2", name: "Un 25kg", category: "Gıda", price: 800, stock: 12, rating: 4.1 },
  { id: "p3", name: "Zeytinyağı 5L", category: "Gıda", price: 950, stock: 7, rating: 4.7 },
  { id: "p4", name: "Vida Seti", category: "İnşaat", price: 220, stock: 60, rating: 4.0 },
  { id: "p5", name: "Gümüş Kolye", category: "Takı", price: 450, stock: 14, rating: 4.3 },
];

router.get("/", (_req, res) => res.json(products));
router.get("/:id", (req, res) => {
  const p = products.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Ürün bulunamadı" });
  res.json(p);
});
router.post("/", (req, res) => {
  const { name, category, price, stock } = req.body;
  const id = "p" + (products.length + 1);
  const newP = { id, name, category, price, stock, rating: 0 };
  products.push(newP);
  res.status(201).json(newP);
});
router.put("/:id", (req, res) => {
  const p = products.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Ürün yok" });
  Object.assign(p, req.body);
  res.json(p);
});
router.delete("/:id", (req, res) => {
  const idx = products.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Ürün yok" });
  const del = products.splice(idx, 1)[0];
  res.json(del);
});
export default router;
