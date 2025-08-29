import { Router } from "express";
const router = Router();
let orders = [];
let orderSeq = 1;
router.get("/", (req, res) => {
  const my = orders.filter(o => o.user_id === req.user.id);
  res.json(my);
});
router.post("/checkout", (req, res) => {
  const { items } = req.body;
  const total = (items || []).reduce((s, i) => s + (i.price * i.quantity), 0);
  const order = { id: `o${orderSeq++}`, user_id: req.user.id, items, status: "pending", total_price: total, created_at: new Date().toISOString() };
  orders.push(order);
  res.status(201).json(order);
});
router.put("/:id/status", (req, res) => {
  const ord = orders.find(o => o.id === req.params.id);
  if (!ord) return res.status(404).json({ error: "Sipariş yok" });
  ord.status = req.body.status || ord.status;
  res.json(ord);
});
export default router;
