import { Router } from "express";
const router = Router();
let favorites = [];
let fSeq = 1;
router.get("/", (req, res) => {
  res.json(favorites.filter(f => f.user_id === req.user.id));
});
router.post("/add", (req, res) => {
  const { product_id } = req.body;
  const f = { id: `f${fSeq++}`, user_id: req.user.id, product_id, created_at: new Date().toISOString() };
  favorites.push(f);
  res.status(201).json(f);
});
router.delete("/remove/:id", (req, res) => {
  favorites = favorites.filter(f => !(f.id === req.params.id && f.user_id === req.user.id));
  res.json({ ok: true });
});
export default router;
