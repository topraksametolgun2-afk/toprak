import { Router } from "express";
const router = Router();
let tickets = [];
let tSeq = 1;
router.post("/tickets", (req, res) => {
  const { subject, message } = req.body;
  const t = { id: `t${tSeq++}`, user_id: req.user.id, subject, message, status: "açık", replies: [], created_at: new Date().toISOString() };
  tickets.push(t);
  res.status(201).json(t);
});
router.get("/tickets", (req, res) => {
  res.json(tickets.filter(t => t.user_id === req.user.id));
});
router.get("/admin/tickets", (_req, res) => {
  res.json(tickets);
});
router.put("/admin/tickets/:id/status", (req, res) => {
  const t = tickets.find(x => x.id === req.params.id);
  if (!t) return res.status(404).json({ error: "Talep yok" });
  t.status = req.body.status || t.status;
  res.json(t);
});
router.post("/admin/tickets/:id/reply", (req, res) => {
  const t = tickets.find(x => x.id === req.params.id);
  if (!t) return res.status(404).json({ error: "Talep yok" });
  t.replies.push({ from: "admin", text: req.body.text, at: new Date().toISOString() });
  res.json(t);
});
export default router;
