import { Router } from "express";
const router = Router();
let reviews = [];
let rSeq = 1;
router.get("/:product_id", (req, res) => {
  const list = reviews.filter(r => r.product_id === req.params.product_id);
  const avg = list.length ? (list.reduce((s,r)=>s+r.rating,0)/list.length).toFixed(2) : 0;
  res.json({ reviews: list, average: Number(avg) });
});
router.post("/", (req, res) => {
  const { product_id, rating, text } = req.body;
  const rev = { id: `r${rSeq++}`, product_id, user_id: req.user.id, rating: Number(rating)||0, text, created_at: new Date().toISOString() };
  reviews.push(rev);
  res.status(201).json(rev);
});
router.put("/:id", (req, res) => {
  const rev = reviews.find(r => r.id === req.params.id && r.user_id === req.user.id);
  if (!rev) return res.status(404).json({ error: "Yorum yok" });
  Object.assign(rev, req.body);
  res.json(rev);
});
router.delete("/:id", (req, res) => {
  const len = reviews.length;
  reviews = reviews.filter(r => !(r.id === req.params.id && r.user_id === req.user.id));
  if (reviews.length === len) return res.status(404).json({ error: "Yorum yok" });
  res.json({ ok: true });
});
export default router;
