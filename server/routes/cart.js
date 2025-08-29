import { Router } from "express";
const router = Router();
let cart = [];
router.get("/", (req, res) => {
  const items = cart.filter(c => c.user_id === req.user.id);
  res.json(items);
});
router.post("/add", (req, res) => {
  const { product_id, quantity } = req.body;
  const row = cart.find(c => c.user_id === req.user.id && c.product_id === product_id);
  if (row) row.quantity += quantity || 1;
  else cart.push({ user_id: req.user.id, product_id, quantity: quantity || 1 });
  res.json({ ok: true });
});
router.put("/update/:product_id", (req, res) => {
  const row = cart.find(c => c.user_id === req.user.id && c.product_id === req.params.product_id);
  if (!row) return res.status(404).json({ error: "Sepette yok" });
  row.quantity = req.body.quantity;
  res.json(row);
});
router.delete("/remove/:product_id", (req, res) => {
  cart = cart.filter(c => !(c.user_id === req.user.id && c.product_id === req.params.product_id));
  res.json({ ok: true });
});
export default router;
