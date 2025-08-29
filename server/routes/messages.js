import { Router } from "express";
const router = Router();
let messages = [];
let msgSeq = 1;
router.get("/:orderId", (req, res) => {
  const list = messages.filter(m => m.order_id === req.params.orderId);
  res.json(list);
});
router.post("/", (req, res) => {
  const { order_id, receiver_id, content } = req.body;
  const m = { id: `m${msgSeq++}`, order_id, sender_id: req.user.id, receiver_id, content, status: "sent", created_at: new Date().toISOString() };
  messages.push(m);
  res.status(201).json(m);
});
export default router;
