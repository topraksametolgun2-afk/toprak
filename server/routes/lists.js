import { Router } from "express";
const router = Router();
let lists = [];
let lSeq = 1;
router.get("/", (req, res) => {
  res.json(lists.filter(l => l.user_id === req.user.id));
});
router.post("/", (req, res) => {
  const { name } = req.body;
  const list = { id: `l${lSeq++}`, user_id: req.user.id, name, items: [], created_at: new Date().toISOString() };
  lists.push(list);
  res.status(201).json(list);
});
router.post("/:id/add", (req, res) => {
  const list = lists.find(l => l.id === req.params.id && l.user_id === req.user.id);
  if (!list) return res.status(404).json({ error: "Liste yok" });
  const { product_id, quantity } = req.body;
  list.items.push({ product_id, quantity: quantity || 1 });
  res.json(list);
});
router.delete("/:id/remove/:product_id", (req, res) => {
  const list = lists.find(l => l.id === req.params.id && l.user_id === req.user.id);
  if (!list) return res.status(404).json({ error: "Liste yok" });
  list.items = list.items.filter(i => i.product_id !== req.params.product_id);
  res.json(list);
});
export default router;
