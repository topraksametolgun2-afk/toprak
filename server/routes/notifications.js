import { Router } from "express";
const router = Router();
let notifications = [];
let nSeq = 1;
router.get("/", (req, res) => {
  const list = notifications.filter(n => n.user_id === req.user.id);
  res.json(list);
});
router.post("/", (req, res) => {
  const { type, message } = req.body;
  const n = { id: `n${nSeq++}`, user_id: req.user.id, type, message, read: false, created_at: new Date().toISOString() };
  notifications.push(n);
  res.status(201).json(n);
});
router.post("/:id/read", (req, res) => {
  const n = notifications.find(x => x.id === req.params.id && x.user_id === req.user.id);
  if (!n) return res.status(404).json({ error: "Bildirim yok" });
  n.read = true;
  res.json(n);
});
export default router;
