import { Router } from "express";
const router = Router();
let inventory = [
  { product_id: "p1", quantity: 25 },
  { product_id: "p2", quantity: 12 },
  { product_id: "p3", quantity: 7 },
  { product_id: "p4", quantity: 60 },
  { product_id: "p5", quantity: 14 },
];
router.get("/", (_req, res) => res.json(inventory));
router.post("/update", (req, res) => {
  const { product_id, quantity } = req.body;
  const row = inventory.find(i => i.product_id === product_id);
  if (!row) return res.status(404).json({ error: "Ürün envanteri yok" });
  row.quantity = quantity;
  res.json(row);
});
export default router;
