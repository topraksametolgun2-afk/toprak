import { Router } from "express";
const router = Router();
router.get("/sales", (_req, res) => {
  res.json({ daily: [5,8,2,10,4,6,9], monthly: [120, 98, 134, 150] });
});
router.get("/orders", (_req, res) => {
  res.json({ pending: 4, approved: 6, shipped: 3, delivered: 12, cancelled: 1 });
});
router.get("/users", (_req, res) => {
  res.json({ buyers: 32, wholesalers: 7 });
});
router.get("/messages", (_req, res) => {
  res.json({ daily: [2,5,3,8,1,4,7] });
});
export default router;
